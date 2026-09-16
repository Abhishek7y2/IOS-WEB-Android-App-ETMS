import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { IUser } from '../../models/User';
import { searchUserDocuments } from '../rag/ragService';
import { FAST_TRACK_DATA } from '../../constants/fastTrackData';

// -----------------------------------------------------------------------------
// RAG (Company Documents) Tool
// -----------------------------------------------------------------------------
export const searchCompanyDocumentsDeclaration: FunctionDeclaration = {
  name: 'searchCompanyDocuments',
  description: 'Searches the user\'s uploaded PDF documents and company documents (RAG) to answer questions about specific files, reports, or data the user has uploaded.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description: 'The question or search query to look for within the uploaded documents (e.g., "What was the Q3 revenue?").',
      },
    },
    required: ['query'],
  },
};

export const handleSearchCompanyDocuments = async (user: IUser, args: { query: string }) => {
  try {
    const answer = await searchUserDocuments(args.query, user._id.toString(), user.role);
    return { success: true, query: args.query, answer };
  } catch (error: any) {
    console.error('Error in searchCompanyDocuments:', error);
    return { success: false, error: 'Failed to search documents.' };
  }
};

// -----------------------------------------------------------------------------
// Company Knowledge Base (Fast Track Data) Tool
// -----------------------------------------------------------------------------
export const searchCompanyKnowledgeBaseDeclaration: FunctionDeclaration = {
  name: 'searchCompanyKnowledgeBase',
  description: 'Searches the official company knowledge base for HR policies, leave rules, IT support, payroll, holidays, and general company guidelines.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      topic: {
        type: SchemaType.STRING,
        description: 'The specific topic or keyword to search for (e.g., "leave policy", "payslip", "IT support", "holiday").',
      },
    },
    required: ['topic'],
  },
};

export const handleSearchCompanyKnowledgeBase = async (user: IUser, args: { topic: string }) => {
  try {
    const topic = args.topic.toLowerCase();
    
    let bestMatch = null;
    let maxMatches = 0;

    for (const entry of FAST_TRACK_DATA) {
      if (entry.requiresRole === 'admin' && user.role !== 'admin' && user.role !== 'superadmin') {
        continue;
      }

      let matches = 0;
      for (const keyword of entry.intentKeywords) {
        if (topic.includes(keyword)) {
          matches++;
        }
      }

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = entry;
      }
    }

    if (bestMatch) {
      return { 
        success: true, 
        topic: args.topic, 
        canonicalQuestion: bestMatch.canonicalQuestion, 
        officialAnswer: bestMatch.answer 
      };
    } else {
      return { 
        success: false, 
        message: 'No specific company policy found for this topic. Please advise the user to contact HR or IT directly.' 
      };
    }
  } catch (error: any) {
    console.error('Error in searchCompanyKnowledgeBase:', error);
    return { success: false, error: 'Failed to search knowledge base.' };
  }
};
