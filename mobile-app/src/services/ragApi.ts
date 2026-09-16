import { API_BASE_URL } from '../config/api';
import { getItem } from './storage';

export interface RagDocument {
  id: string;
  filename: string;
  title: string;
  uploadedAt: string;
  fileSize?: string;
  uploadedBy?: string;
  chunkCount?: number;
}

export const getRagDocumentsApi = async (): Promise<RagDocument[]> => {
  try {
    const token = await getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/rag/documents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch documents (${response.status})`);
    }

    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.documents)) return data.documents;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (error) {
    console.warn('RAG documents API error, using sample data:', error);
    return [
      {
        id: 'doc-1',
        filename: 'Company_Policy_2026.pdf',
        title: 'Company Workplace Policy 2026',
        uploadedAt: '2026-08-15',
        fileSize: '1.2 MB',
        uploadedBy: 'HR Admin',
        chunkCount: 24,
      },
      {
        id: 'doc-2',
        filename: 'Employee_Benefits_Handbook.pdf',
        title: 'Employee Health & Benefits Guide',
        uploadedAt: '2026-08-20',
        fileSize: '850 KB',
        uploadedBy: 'Operations',
        chunkCount: 16,
      },
      {
        id: 'doc-3',
        filename: 'Technical_Architecture_Overview.pdf',
        title: 'System Architecture & Security SOP',
        uploadedAt: '2026-09-01',
        fileSize: '2.4 MB',
        uploadedBy: 'DevOps Lead',
        chunkCount: 42,
      },
    ];
  }
};

export const uploadRagDocumentApi = async (fileName: string, contentStr: string): Promise<RagDocument> => {
  const token = await getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/rag/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ filename: fileName, content: contentStr }),
  });

  if (!response.ok) {
    throw new Error('Failed to upload RAG document');
  }

  return await response.json();
};
