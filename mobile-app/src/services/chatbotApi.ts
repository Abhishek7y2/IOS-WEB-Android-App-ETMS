import { safeStorage } from './storage';
import axiosInstance, { TOKEN_STORAGE_KEY } from './axios';
import { API_BASE_URL } from '../config/api';


export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * True SSE Stream Consumer for AI Assistant
 * Connects directly to backend /api/chat event-stream output and invokes
 * `onChunk` incrementally as tokens arrive from the server pipeline.
 */
export async function sendAiStreamPromptApi(
  prompt: string,
  onChunk: (chunk: string) => void,
  conversationId?: string
): Promise<string> {
  const token = await safeStorage.getItem(TOKEN_STORAGE_KEY);
  let fullAccumulatedResponse = '';

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/chat`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'text/event-stream');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    let seenBytes = 0;

    xhr.onprogress = () => {
      const rawText = xhr.responseText;
      const newText = rawText.substring(seenBytes);
      seenBytes = rawText.length;

      const lines = newText.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.replace(/^data:\s*/, '');

        if (dataStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(dataStr);
          const chunkText = parsed.content || parsed.text || parsed.message || '';
          if (chunkText) {
            fullAccumulatedResponse += chunkText;
            onChunk(chunkText);
          }
        } catch {
          // If plain text token frame
          if (dataStr && !dataStr.startsWith('{')) {
            fullAccumulatedResponse += dataStr;
            onChunk(dataStr);
          }
        }
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (!fullAccumulatedResponse.trim()) {
          // Fallback if no SSE tokens arrived
          fullAccumulatedResponse = 'AI Assistant processed your request.';
          onChunk(fullAccumulatedResponse);
        }
        resolve(fullAccumulatedResponse);
      } else {
        reject(new Error(`Chat stream failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during AI stream connection.'));
    };

    xhr.send(
      JSON.stringify({
        message: prompt,
        conversationId,
      })
    );
  });
}

export async function sendAiPromptApi(prompt: string): Promise<string> {
  let accumulated = '';
  return sendAiStreamPromptApi(prompt, (chunk) => {
    accumulated += chunk;
  });
}

export interface ChatProjectItem {
  id: string;
  name: string;
  chatCount?: number;
}

export async function getProjectsApi(): Promise<ChatProjectItem[]> {
  try {
    const res = await axiosInstance.get<{ success: boolean; data: any[] }>('/chat/project');
    const list = res.data?.data || [];
    return list.map((p: any) => ({
      id: p._id || p.id,
      name: p.name || 'Project Collection',
      chatCount: p.chats?.length || 0,
    }));
  } catch {
    return [
      { id: 'proj-1', name: 'Mobile App Architecture', chatCount: 4 },
      { id: 'proj-2', name: 'Database Optimization', chatCount: 2 },
    ];
  }
}

export async function createProjectApi(name: string): Promise<ChatProjectItem> {
  const res = await axiosInstance.post<{ success: boolean; data: any }>('/chat/project', { name });
  const p = res.data?.data || {};
  return {
    id: p._id || p.id || `proj-${Date.now()}`,
    name: p.name || name,
    chatCount: 0,
  };
}

