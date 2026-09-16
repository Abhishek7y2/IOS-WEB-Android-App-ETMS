import axios from '../axios';

// =========================================================================
// RAG (Retrieval-Augmented Generation) API Service
// Yeh file frontend ko backend ki RAG APIs se connect karti hai.
// =========================================================================

/**
 * Uploads a PDF document to the backend for RAG processing.
 * @param file The PDF file to upload.
 * @returns The API response data.
 */
export const uploadDocument = async (file: File) => {
  // FormData is used to send files via HTTP POST
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    `/rag/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000 // Overriding default timeout since PDF processing takes longer
    }
  );
  
  // Return parsed JSON data automatically provided by Axios
  return response.data;
};

/**
 * Asks a question to the AI based on a previously uploaded document.
 * @param documentId The ID of the uploaded document.
 * @param question The user's question.
 * @returns The API response data containing the AI's answer.
 */
export const askQuestion = async (documentId: string, question: string) => {
  const response = await axios.post(
    `/rag/ask`,
    { documentId, question },
    {
      timeout: 60000 // RAG operations and Gemini AI responses can take up to a minute
    }
  );
  
  return response.data;
};

/**
 * Fetches all documents uploaded by the current user.
 * @returns List of documents.
 */
export const getDocuments = async () => {
  const response = await axios.get(
    `/rag/documents`
  );
  
  return response.data;
};
