import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { processChat, processChatStream } from '../services/chatbot/chatService';
import ChatHistory from '../models/ChatHistory';
import ConversationMemory from '../models/ConversationMemory';
import ChatLibrary from '../models/ChatLibrary';
import ChatProject from '../models/ChatProject';
import { generateGreeting } from '../services/chatbot/greetingService';

/**
 * @description Entry point for incoming chat messages from the frontend.
 * @logic
 * - Receives the message (or file attachment) and passes it to the `chatService`.
 * - Validates that the payload contains at least a text message or a file.
 * - Forwards the request to Gemini's AI processing pipeline.
 */
export async function handleChatMessage(req: AuthRequest, res: Response) {
  try {
    const { message, conversationId, attachment } = req.body;
    if (!message && !attachment) {
      return res.status(400).json({ success: false, message: 'Message or attachment is required.' });
    }
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Set headers for SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Ensure headers are sent immediately

    const stream = processChatStream(req.user, message, conversationId, attachment);

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    let errorMessage = error.message || 'Failed to process chat';
    if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded') || errorMessage.includes('Too Many Requests')) {
      errorMessage = "Server is currently experiencing high traffic (API Quota Exceeded). Please try again in a few minutes.";
    }

    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: errorMessage });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
      res.end();
    }
  }
}

/**
 * @description Retrieves the active (non-archived) chat sessions for the current user.
 * @logic
 * - Filters by `userId` to ensure users cannot view each other's chats (Privacy Control).
 * - Sorts by `updatedAt` descending to show recent chats first.
 */
export async function getChatHistory(req: AuthRequest, res: Response) {
  try {
    const histories = await ChatHistory.find({ userId: req.user?._id, isArchived: { $ne: true } })
      .sort({ updatedAt: -1 })
      .limit(20);
    return res.status(200).json({ success: true, data: histories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
}

/**
 * @description Retrieves archived chat sessions.
 * @logic Only fetches chats marked as isArchived for the logged-in user.
 */
export async function getArchivedChats(req: AuthRequest, res: Response) {
  try {
    const histories = await ChatHistory.find({ userId: req.user?._id, isArchived: true })
      .sort({ updatedAt: -1 })
      .limit(50);
    return res.status(200).json({ success: true, data: histories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch archived history' });
  }
}

/**
 * @description Generates a contextual, zero-latency greeting for the user.
 * @logic Checks if the user has previous history to determine if they are new or returning.
 */
export async function getGreeting(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const historyCount = await ChatHistory.countDocuments({ userId: req.user._id });
    const hasHistory = historyCount > 0;
    const greeting = generateGreeting(req.user as any, hasHistory);
    return res.status(200).json({ success: true, data: { greeting } });
  } catch (error) {
    console.error('Error fetching greeting:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch greeting' });
  }
}

/**
 * @description Retrieves a specific conversation's full history.
 * @logic Fetches the ChatHistory document and all associated ConversationMemory messages.
 */
export async function getConversation(req: AuthRequest, res: Response) {
  try {
    const { conversationId } = req.params;
    const history = await ChatHistory.findOne({ _id: conversationId, userId: req.user?._id });
    if (!history) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    const messages = await ConversationMemory.find({ chatHistoryId: conversationId }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: { conversationId, messages } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
}

/**
 * @description Deletes a chat session permanently.
 * @logic Removes the ChatHistory, deletes all linked messages, and removes references from Projects/Libraries.
 */
export async function deleteChat(req: AuthRequest, res: Response) {
  try {
    const { chatId } = req.params;
    const history = await ChatHistory.findOneAndDelete({ _id: chatId, userId: req.user?._id });
    if (!history) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    // Delete associated memories
    await ConversationMemory.deleteMany({ chatHistoryId: chatId });
    
    // Also remove from any projects or libraries
    await ChatProject.updateMany({ chats: chatId }, { $pull: { chats: chatId } });
    await ChatLibrary.updateMany({ chats: chatId }, { $pull: { chats: chatId } });

    return res.status(200).json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete chat' });
  }
}

/**
 * @description Creates a new library folder to organize chats.
 */
export async function createLibrary(req: AuthRequest, res: Response) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Library name is required' });
    const library = await ChatLibrary.create({ userId: req.user?._id, name, chats: [] });
    return res.status(201).json({ success: true, data: library });
  } catch (error) {
    console.error('Error creating library:', error);
    return res.status(500).json({ success: false, message: 'Failed to create library' });
  }
}

export async function getLibraries(req: AuthRequest, res: Response) {
  try {
    const libraries = await ChatLibrary.find({ userId: req.user?._id }).populate('chats', 'title updatedAt');
    return res.status(200).json({ success: true, data: libraries });
  } catch (error) {
    console.error('Error fetching libraries:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch libraries' });
  }
}

export async function addChatToLibrary(req: AuthRequest, res: Response) {
  try {
    const { libraryId } = req.params;
    const { chatId } = req.body;
    const library = await ChatLibrary.findOne({ _id: libraryId, userId: req.user?._id });
    if (!library) return res.status(404).json({ success: false, message: 'Library not found' });
    if (!library.chats.includes(chatId)) {
      library.chats.push(chatId);
      await library.save();
    }
    return res.status(200).json({ success: true, data: library });
  } catch (error) {
    console.error('Error adding chat to library:', error);
    return res.status(500).json({ success: false, message: 'Failed to add chat to library' });
  }
}

/**
 * @description Creates a new project folder for grouping related AI chats.
 */
export async function createProject(req: AuthRequest, res: Response) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Project name is required' });
    const project = await ChatProject.create({ userId: req.user?._id, name, chats: [] });
    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ success: false, message: 'Failed to create project' });
  }
}

export async function getProjects(req: AuthRequest, res: Response) {
  try {
    const projects = await ChatProject.find({ userId: req.user?._id, isArchived: { $ne: true } }).populate('chats', 'title updatedAt');
    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
}

export async function addChatToProject(req: AuthRequest, res: Response) {
  try {
    const { projectId } = req.params;
    const { chatId } = req.body;
    const project = await ChatProject.findOne({ _id: projectId, userId: req.user?._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (!project.chats.includes(chatId)) {
      project.chats.push(chatId);
      await project.save();
    }
    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('Error adding chat to project:', error);
    return res.status(500).json({ success: false, message: 'Failed to add chat to project' });
  }
}

/**
 * @description Updates the title of an existing chat.
 */
export async function renameChat(req: AuthRequest, res: Response) {
  try {
    const { chatId } = req.params;
    const { title } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    const history = await ChatHistory.findOneAndUpdate({ _id: chatId, userId: req.user?._id }, { title }, { new: true });
    if (!history) return res.status(404).json({ success: false, message: 'Chat not found' });
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('Error renaming chat:', error);
    return res.status(500).json({ success: false, message: 'Failed to rename chat' });
  }
}

/**
 * @description Toggles the pinned status of a chat (pins/unpins it).
 */
export async function pinChat(req: AuthRequest, res: Response) {
  try {
    const { chatId } = req.params;
    const history = await ChatHistory.findOne({ _id: chatId, userId: req.user?._id });
    if (!history) return res.status(404).json({ success: false, message: 'Chat not found' });
    
    history.isPinned = !history.isPinned;
    await history.save();
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('Error pinning chat:', error);
    return res.status(500).json({ success: false, message: 'Failed to pin chat' });
  }
}

/**
 * @description Toggles the archived status of a chat (archives/unarchives it).
 */
export async function archiveChat(req: AuthRequest, res: Response) {
  try {
    const { chatId } = req.params;
    const history = await ChatHistory.findOne({ _id: chatId, userId: req.user?._id });
    if (!history) return res.status(404).json({ success: false, message: 'Chat not found' });
    
    history.isArchived = !history.isArchived;
    await history.save();
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('Error archiving chat:', error);
    return res.status(500).json({ success: false, message: 'Failed to archive chat' });
  }
}

export async function renameProject(req: AuthRequest, res: Response) {
  try {
    const { projectId } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    const project = await ChatProject.findOneAndUpdate({ _id: projectId, userId: req.user?._id }, { name }, { new: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('Error renaming project:', error);
    return res.status(500).json({ success: false, message: 'Failed to rename project' });
  }
}

export async function deleteProject(req: AuthRequest, res: Response) {
  try {
    const { projectId } = req.params;
    const project = await ChatProject.findOneAndDelete({ _id: projectId, userId: req.user?._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    return res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
}

export async function pinProject(req: AuthRequest, res: Response) {
  try {
    const { projectId } = req.params;
    const project = await ChatProject.findOne({ _id: projectId, userId: req.user?._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    project.isPinned = !project.isPinned;
    await project.save();
    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('Error pinning project:', error);
    return res.status(500).json({ success: false, message: 'Failed to pin project' });
  }
}

export async function archiveProject(req: AuthRequest, res: Response) {
  try {
    const { projectId } = req.params;
    const project = await ChatProject.findOne({ _id: projectId, userId: req.user?._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    project.isArchived = !project.isArchived;
    await project.save();
    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('Error archiving project:', error);
    return res.status(500).json({ success: false, message: 'Failed to archive project' });
  }
}

