/**
 * CHANGELOG:
 * - [2026-08-04]: Upgraded RAG Document Chunking Strategy.
 *    - Replaced hardcoded (800/150) char splitting with semantic-aware paragraph/sentence chunking.
 *    - Extracted CHUNK_SIZE and CHUNK_OVERLAP into ENV variables.
 *    - Attached extensive metadata (fileName, uploaderId, uploaderRole, pageNumber) to DocumentChunk for better traceability.
 *    - Implemented batch embedding calls (batchEmbedContents) and batch DB inserts (insertMany) to drastically reduce Gemini API round trips.
 *    - Upgraded RAG Retrieval: Configurable top-k (RAG_TOP_K) and minimum similarity score cutoff (RAG_MIN_SCORE). Added metadata citations to LLM prompt.
 *    - Implemented RAG Access Control (RBAC): Admin can query all chunks; User can only query their own chunks.
 *    - Implemented Re-Indexing / Lifecycle: Cascade-delete hooks for DocumentChunk on Document deletion; auto-purge old chunks on re-upload.
 *    - Implemented Failure Handling: Graceful fallbacks for corrupt PDFs, embedding API timeouts, and zero-match retrieval scenarios.
 */
import { IUser } from '../../models/User';
import ChatHistory from '../../models/ChatHistory';
import ConversationMemory from '../../models/ConversationMemory';
import { sendPromptWithTools, sendPromptWithToolsStream } from './geminiService';
import { fetchTasksDeclaration, handleFetchTasks, createTaskDeclaration, handleCreateTask, updateTaskStatusDeclaration, handleUpdateTaskStatus } from './taskService';
import { getEmployeeWorkloadDeclaration, handleGetEmployeeWorkload } from './employeeService';
import { createAnnouncementDeclaration, handleCreateAnnouncement, fetchAnnouncementsDeclaration, handleFetchAnnouncements } from './communicationService';
import { searchCompanyDocumentsDeclaration, handleSearchCompanyDocuments, searchCompanyKnowledgeBaseDeclaration, handleSearchCompanyKnowledgeBase } from './knowledgeService';


import { getSystemPrompt } from '../../constants/prompts';
import { isGibberish } from '../../utils/gibberishDetector';
import { matchFastTrack } from '../../utils/fastTrackMatcher';
import { generateGreeting } from './greetingService';

// Ye main function hai jo user ki chat ko handle karta hai (New chat banana, message AI ko bhejna, aur tool call karna)
export async function processChat(user: IUser, message: string = "", conversationId?: string, attachment?: { name: string, content: string, mimeType: string }) {
  let chatHistoryId = conversationId;

  if (!chatHistoryId) {
    // Generate a fast fallback title immediately
    let fallbackTitle = message.split(' ').slice(0, 5).join(' ') + (message.split(' ').length > 5 ? '...' : '');
    if (!fallbackTitle.trim()) fallbackTitle = 'New Conversation';

    // Create the history document instantly so we get the ID without waiting for AI
    const newHistory = await ChatHistory.create({
      userId: user._id,
      title: fallbackTitle,
    });
    chatHistoryId = newHistory._id.toString();

    // =========================================================================
    // PERFORMANCE OPTIMIZATION: Asynchronous Title Generation
    // We fire-and-forget the AI title generation so it runs in the background.
    // This saves ~3-5 seconds on the user's first message!
    // =========================================================================
    const generateAndSetTitle = async (historyId: string) => {
      try {
        const titlePrompt = `Generate a very short (2-5 words) summary title for a conversation that begins with this message. Do not include quotes or formatting. Just the title text.\n\nMessage: "${message}"`;
        const titleResponse = await sendPromptWithTools('You are a helpful summarizer.', [], titlePrompt, []);
        if (titleResponse.text()) {
          const aiTitle = titleResponse.text().trim().replace(/^["']|["']$/g, '');
          await ChatHistory.findByIdAndUpdate(historyId, { title: aiTitle });
        }
      } catch (err) {
        console.warn('Failed to generate chat title asynchronously.', err);
      }
    };

    // Call the function WITHOUT `await` so it doesn't block the thread
    if (chatHistoryId) {
      generateAndSetTitle(chatHistoryId);
    }
  }

  const savedContent = attachment ? `[Attached: ${attachment.name}]\n\n${message}` : message;
  await ConversationMemory.create({ chatHistoryId, role: 'user', content: savedContent });

  if (!attachment && isGibberish(message)) {
    const fallbackMessage = "Hmm, I didn't quite catch that. 🤔 Could you please rephrase or type your question again?";
    const aiMemory = await ConversationMemory.create({ chatHistoryId, role: 'assistant', content: fallbackMessage });
    return {
      conversationId: chatHistoryId,
      message: { role: aiMemory.role, content: aiMemory.content, timestamp: aiMemory.createdAt },
      systemEvents: []
    };
  }

  // FAST TRACK: Instant responses for common EMS queries (Bypass LLM)
  if (!attachment) {
    // 1. Check for standard greetings
    const lowerText = message.toLowerCase().trim();
    const simpleGreetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'hola', 'namaste'];
    if (simpleGreetings.includes(lowerText)) {
      const historyCount = await ChatHistory.countDocuments({ userId: user._id });
      const hasHistory = historyCount > 1; // Since we just created one, > 1 means previous history exists
      const greetingResponse = generateGreeting(user, hasHistory);
      
      const aiMemory = await ConversationMemory.create({ chatHistoryId, role: 'assistant', content: greetingResponse });
      return {
        conversationId: chatHistoryId,
        message: { role: aiMemory.role, content: aiMemory.content, timestamp: aiMemory.createdAt },
        systemEvents: []
      };
    }

    // 2. Check for dynamic Fast Track data
    const fastTrackResult = await matchFastTrack(message, user.role, user._id.toString());
    if (fastTrackResult && fastTrackResult.hit) {
      const aiMemory = await ConversationMemory.create({ chatHistoryId, role: 'assistant', content: fastTrackResult.answer });
      console.log(`[ANALYTICS] FAST_TRACK_CACHE_HIT | Intent: ${fastTrackResult.matchedIntentId} | User: ${user._id}`);
      return {
        conversationId: chatHistoryId,
        message: { role: aiMemory.role, content: aiMemory.content, timestamp: aiMemory.createdAt },
        systemEvents: [fastTrackResult.source]
      };
    }
  }

  // Chat history (purani baatein) database se nikal kar AI ke samajhne wale format me convert karna
  const pastMessages = await ConversationMemory.find({ chatHistoryId }).sort({ createdAt: -1 }).limit(20).lean();
  let rawHistory = pastMessages.reverse().map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content || ' ' }],
  }));
  rawHistory.pop(); // Remove the current user message

  // Gemini requires strictly alternating history starting with 'user'
  const history: any[] = [];
  for (const msg of rawHistory) {
    if (history.length === 0) {
      if (msg.role === 'user') history.push(msg);
    } else {
      if (history[history.length - 1].role !== msg.role) {
        history.push(msg);
      }
    }
  }

  // Ensure the history ends with 'model' before we send a new 'user' message
  if (history.length > 0 && history[history.length - 1].role === 'user') {
    history.pop();
  }

  const tools = [
    {
      functionDeclarations: [
        fetchTasksDeclaration,
        createTaskDeclaration,
        updateTaskStatusDeclaration,
        getEmployeeWorkloadDeclaration,
        createAnnouncementDeclaration,
        fetchAnnouncementsDeclaration
      ]
    }
  ];

  let promptParts: any = message;

  if (attachment) {
    promptParts = [
      { text: `[Attached File: ${attachment.name}]\n${message}` },
      { inlineData: { data: attachment.content, mimeType: attachment.mimeType } }
    ];
  }

  const response = await sendPromptWithTools(getSystemPrompt(user), history, promptParts, tools);

  let finalContent = '';
  try {
    finalContent = response.text();
  } catch (e) {
    // text() throws if there is no text part (which is common when a function call is made)
  }

  const functionCall = response.functionCalls()?.[0];
  let systemEvents: string[] = [];

  // Agar AI ne decide kiya ki koi tool/function chalana chahiye (jaise task banana ya workload check karna)
  if (functionCall) {
    let resultJSON: any = null;
    const args = functionCall.args as any;

    try {
      switch (functionCall.name) {
        case 'fetchTasks':
          resultJSON = await handleFetchTasks(user, args);
          break;
        case 'createTask':
          resultJSON = await handleCreateTask(user, args);
          systemEvents.push('TASK_CREATED');
          break;
        case 'updateTaskStatus':
          resultJSON = await handleUpdateTaskStatus(user, args);
          systemEvents.push('TASK_UPDATED');
          break;
        case 'getEmployeeWorkload':
          resultJSON = await handleGetEmployeeWorkload(user, args);
          break;
        case 'createAnnouncement':
          resultJSON = await handleCreateAnnouncement(user, args);
          systemEvents.push('ANNOUNCEMENT_CREATED');
          break;
        case 'fetchAnnouncements':
          resultJSON = await handleFetchAnnouncements(user, args);
          break;
        case 'searchCompanyDocuments':
          resultJSON = await handleSearchCompanyDocuments(user, args);
          break;
        case 'searchCompanyKnowledgeBase':
          resultJSON = await handleSearchCompanyKnowledgeBase(user, args);
          break;
        default:
          resultJSON = { error: 'Unknown tool called by AI.' };
      }
    } catch (err: any) {
      resultJSON = { error: 'Internal server error while executing tool: ' + err.message };
    }

    const followUpPrompt = `The user originally asked: "${message}". The tool returned this JSON: ${JSON.stringify(resultJSON)}. Please synthesize it for the user in markdown.`;
    const followUpResponse = await sendPromptWithTools(getSystemPrompt(user), history, followUpPrompt, []);
    finalContent = followUpResponse.text();
  }

  const aiMemory = await ConversationMemory.create({ chatHistoryId, role: 'assistant', content: finalContent || 'I successfully processed your request, but did not generate a text response.' });

  return {
    conversationId: chatHistoryId,
    message: { role: aiMemory.role, content: aiMemory.content, timestamp: aiMemory.createdAt },
    systemEvents
  };
}

// Ye naya function real-time SSE streaming ke liye hai
export async function* processChatStream(user: IUser, message: string = "", conversationId?: string, attachment?: { name: string, content: string, mimeType: string }): AsyncGenerator<any, void, unknown> {
  let chatHistoryId = conversationId;

  if (!chatHistoryId) {
    let fallbackTitle = message.split(' ').slice(0, 5).join(' ') + (message.split(' ').length > 5 ? '...' : '');
    if (!fallbackTitle.trim()) fallbackTitle = 'New Conversation';

    const newHistory = await ChatHistory.create({
      userId: user._id,
      title: fallbackTitle,
    });
    chatHistoryId = newHistory._id.toString();

    const generateAndSetTitle = async (historyId: string) => {
      try {
        const titlePrompt = `Generate a very short (2-5 words) summary title for a conversation that begins with this message. Do not include quotes or formatting. Just the title text.\n\nMessage: "${message}"`;
        const titleResponse = await sendPromptWithTools('You are a helpful summarizer.', [], titlePrompt, []);
        if (titleResponse.text()) {
          const aiTitle = titleResponse.text().trim().replace(/^["']|["']$/g, '');
          await ChatHistory.findByIdAndUpdate(historyId, { title: aiTitle });
        }
      } catch (err) {
        console.warn('Failed to generate chat title asynchronously.', err);
      }
    };

    if (chatHistoryId) {
      generateAndSetTitle(chatHistoryId);
    }
  }

  // Yield the conversationId immediately so the client can save it
  yield { type: 'metadata', data: { conversationId: chatHistoryId, systemEvents: [] } };

  const savedContent = attachment ? `[Attached: ${attachment.name}]\n\n${message}` : message;
  await ConversationMemory.create({ chatHistoryId, role: 'user', content: savedContent });

  if (!attachment && isGibberish(message)) {
    const fallbackMessage = "Hmm, I didn't quite catch that. 🤔 Could you please rephrase or type your question again?";
    const aiMemory = await ConversationMemory.create({ chatHistoryId, role: 'assistant', content: fallbackMessage });
    yield { type: 'chunk', text: fallbackMessage };
    yield { type: 'done', message: { role: aiMemory.role, content: aiMemory.content, timestamp: aiMemory.createdAt } };
    return;
  }

  if (!attachment) {
    const lowerText = message.toLowerCase().trim();
    const simpleGreetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'hola', 'namaste'];
    if (simpleGreetings.includes(lowerText)) {
      const historyCount = await ChatHistory.countDocuments({ userId: user._id });
      const hasHistory = historyCount > 1; 
      const greetingResponse = generateGreeting(user, hasHistory);
      
      const aiMemory = await ConversationMemory.create({ chatHistoryId, role: 'assistant', content: greetingResponse });
      yield { type: 'metadata', data: { conversationId: chatHistoryId, systemEvents: [] } };
      yield { type: 'chunk', text: greetingResponse };
      yield { type: 'done', message: { role: aiMemory.role, content: aiMemory.content, timestamp: aiMemory.createdAt } };
      return;
    }

    const fastTrackResult = await matchFastTrack(message, user.role, user._id.toString());
    if (fastTrackResult && fastTrackResult.hit) {
      const aiMemory = await ConversationMemory.create({ chatHistoryId, role: 'assistant', content: fastTrackResult.answer });
      yield { type: 'metadata', data: { conversationId: chatHistoryId, systemEvents: [fastTrackResult.source] } };
      yield { type: 'chunk', text: fastTrackResult.answer };
      yield { type: 'done', message: { role: aiMemory.role, content: aiMemory.content, timestamp: aiMemory.createdAt } };
      return;
    }
  }

  const pastMessages = await ConversationMemory.find({ chatHistoryId }).sort({ createdAt: -1 }).limit(20).lean();
  let rawHistory = pastMessages.reverse().map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content || ' ' }],
  }));
  rawHistory.pop();

  const history: any[] = [];
  for (const msg of rawHistory) {
    if (history.length === 0) {
      if (msg.role === 'user') history.push(msg);
    } else {
      if (history[history.length - 1].role !== msg.role) {
        history.push(msg);
      }
    }
  }
  if (history.length > 0 && history[history.length - 1].role === 'user') history.pop();

  const tools = [
    {
      functionDeclarations: [
        fetchTasksDeclaration, createTaskDeclaration, updateTaskStatusDeclaration,
        getEmployeeWorkloadDeclaration, createAnnouncementDeclaration, fetchAnnouncementsDeclaration,
        searchCompanyDocumentsDeclaration, searchCompanyKnowledgeBaseDeclaration
      ]
    }
  ];

  let promptParts: any = message;
  if (attachment) {
    promptParts = [
      { text: `[Attached File: ${attachment.name}]\n${message}` },
      { inlineData: { data: attachment.content, mimeType: attachment.mimeType } }
    ];
  }

  // Instead of a blocking call, we start a stream immediately
  const streamResult = await sendPromptWithToolsStream(getSystemPrompt(user), history, promptParts, tools);

  let functionCall: any = null;
  let fullText = '';
  let systemEvents: string[] = [];

  for await (const chunk of streamResult.stream) {
    if (chunk.functionCalls() && chunk.functionCalls()!.length > 0) {
      functionCall = chunk.functionCalls()![0];
      break; // Stop streaming if it decides to call a function
    }
    const chunkText = chunk.text();
    fullText += chunkText;
    yield { type: 'chunk', text: chunkText };
  }

  if (functionCall) {
    let resultJSON: any = null;
    const args = functionCall.args as any;
    try {
      switch (functionCall.name) {
        case 'fetchTasks': resultJSON = await handleFetchTasks(user, args); break;
        case 'createTask': resultJSON = await handleCreateTask(user, args); systemEvents.push('TASK_CREATED'); break;
        case 'updateTaskStatus': resultJSON = await handleUpdateTaskStatus(user, args); systemEvents.push('TASK_UPDATED'); break;
        case 'getEmployeeWorkload': resultJSON = await handleGetEmployeeWorkload(user, args); break;
        case 'createAnnouncement': resultJSON = await handleCreateAnnouncement(user, args); systemEvents.push('ANNOUNCEMENT_CREATED'); break;
        case 'fetchAnnouncements': resultJSON = await handleFetchAnnouncements(user, args); break;
        case 'searchCompanyDocuments': resultJSON = await handleSearchCompanyDocuments(user, args); break;
        case 'searchCompanyKnowledgeBase': resultJSON = await handleSearchCompanyKnowledgeBase(user, args); break;
        default: resultJSON = { error: 'Unknown tool called by AI.' };
      }
    } catch (err: any) {
      resultJSON = { error: 'Internal server error while executing tool: ' + err.message };
    }

    if (systemEvents.length > 0) {
      yield { type: 'metadata', data: { conversationId: chatHistoryId, systemEvents } };
    }

    const followUpPrompt = `The user originally asked: "${message}". The tool returned this data: ${JSON.stringify(resultJSON)}. 
Please synthesize this data into a highly conversational, friendly, and human-like response. 
DO NOT just spit out raw data or JSON-like lists. 
Use rich Markdown formatting (bullet points, bold text for emphasis, spacing) and relevant emojis to make it look premium and easy to read.`;

    // NOW we stream the synthesis response
    const followUpStream = await sendPromptWithToolsStream(getSystemPrompt(user), history, followUpPrompt, []);
    for await (const chunk of followUpStream.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      yield { type: 'chunk', text: chunkText };
    }
  }

  const aiMemory = await ConversationMemory.create({ chatHistoryId, role: 'assistant', content: fullText || 'I successfully processed your request.' });
  yield { type: 'done', message: { role: aiMemory.role, content: aiMemory.content, timestamp: aiMemory.createdAt } };
}
