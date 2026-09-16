import { GoogleGenerativeAI, FunctionDeclaration } from '@google/generative-ai';

// Gemini API SDK ko initialize karna. Agar key .env me nahi hai toh error dega.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

// Gemini SDK me kabhi kabhi naye keys ke sath issue aata hai, 
// isliye hum customFetch banate hain taaki API key strictly URL me jaye.
const customFetch = async (url: string | URL | Request, init?: RequestInit) => {
  const urlObj = new URL(url.toString());
  // URL parameters me key add karna
  urlObj.searchParams.set('key', process.env.GEMINI_API_KEY || '');
  
  // Create new headers and remove the invalid Bearer token
  const headers = new Headers(init?.headers);
  headers.delete('Authorization');
  
  return fetch(urlObj.toString(), {
    ...init,
    headers
  });
};

// AI model set karna, yahan 'gemini-flash-latest' use kiya gaya hai jo fast hai aur functions call kar sakta hai
const model = genAI.getGenerativeModel(
  { model: 'gemini-flash-latest' },
  { customFetch } as any
);

// Ye main function hai jo user ki chat ko Gemini AI tak bhejta hai
export async function sendPromptWithTools(
  systemInstruction: string, // AI ko samjhana ki uska role kya hai
  history: any[], // Purani baatein (Context)
  prompt: string | any[], // Naya message
  tools: { functionDeclarations: FunctionDeclaration[] }[] // AI ko diye gaye tools (actions)
) {
  const modelConfig: any = {
    model: 'gemini-flash-latest',
    systemInstruction,
  };

  if (tools && tools.length > 0) {
    modelConfig.tools = tools;
  }

  const modelWithConfig = genAI.getGenerativeModel(
    modelConfig,
    { customFetch } as any
  );

  const chat = modelWithConfig.startChat({
    history,
  });

  const result = await chat.sendMessage(prompt);
  const response = result.response;
  
  return response;
}

// Ye naya function streaming ke liye hai
export async function sendPromptWithToolsStream(
  systemInstruction: string,
  history: any[],
  prompt: string | any[],
  tools: { functionDeclarations: FunctionDeclaration[] }[]
) {
  const modelConfig: any = {
    model: 'gemini-flash-latest',
    systemInstruction,
  };

  if (tools && tools.length > 0) {
    modelConfig.tools = tools;
  }

  const modelWithConfig = genAI.getGenerativeModel(
    modelConfig,
    { customFetch } as any
  );

  const chat = modelWithConfig.startChat({
    history,
  });

  const result = await chat.sendMessageStream(prompt);
  return result;
}
