import axiosInstance from './axios';

export interface NoteItem {
  id: string;
  dateStr: string;
  title: string;
  content: string;
  updatedAt?: string;
}

export async function getNoteByDateApi(dateStr: string): Promise<string> {
  try {
    const response = await axiosInstance.get<{ success: boolean; data: { content: string } }>(`/notes/${dateStr}`);
    return response.data?.data?.content || '';
  } catch {
    return '';
  }
}

export async function saveNoteByDateApi(dateStr: string, content: string): Promise<void> {
  try {
    await axiosInstance.post(`/notes/${dateStr}`, {
      dateStr,
      content,
    });
  } catch (err: any) {
    console.error('Failed to save date note to backend:', err?.message);
  }
}
