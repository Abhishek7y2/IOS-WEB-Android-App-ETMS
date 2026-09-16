import React, { useState, useRef, useEffect } from 'react';
import { askQuestion } from '../../services/rag/ragApi';
import { ChatBubble } from '../chatbot/ChatBubble';
import { ChatInput } from '../chatbot/ChatInput';
import { TypingIndicator } from '../chatbot/TypingIndicator';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export const DocumentChat = ({ documentId }: { documentId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    // 1. Add user message to UI immediately
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // 2. Show the typing animation
    setIsTyping(true);

    try {
      // 3. Call the Backend RAG API
      const response = await askQuestion(documentId, text); // Token is automatically attached by Axios interceptor
      
      if (response.success && response.data) {
        // 4. Add AI answer to UI
        const aiMessage: Message = {
          role: 'assistant',
          content: response.data.answer,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.message || 'Failed to get an answer from the document.');
      }
    } catch (err: any) {
      // 5. Handle Errors gracefully in the chat
      const systemMessage: Message = {
        role: 'system',
        content: err.message || 'Network error occurred while asking question.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, systemMessage]);
    } finally {
      // 6. Stop the typing animation
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative w-full bg-white dark:bg-zinc-950">
      
      {/* HEADER SECTION */}
      <div className="flex-none p-4 pb-2 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            📄
          </div>
          <div>
            <h2 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
              Document Analysis Mode
            </h2>
            <p className="text-xs text-zinc-600">
              Ask anything about your uploaded PDF document.
            </p>
          </div>
        </div>
      </div>
      
      {/* CHAT MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto flex flex-col">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center mt-20">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 text-2xl">
                🤖
              </div>
              <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
                I'm ready to answer!
              </h3>
              <p className="text-sm text-zinc-600 mt-2 max-w-sm">
                Try asking a specific question based on the document you just uploaded.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <ChatBubble 
                  key={idx} 
                  role={msg.role} 
                  content={msg.content} 
                  timestamp={msg.timestamp} 
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="flex-none sticky bottom-0 z-10">
        {/* Re-using the exact ChatInput component used in the main chatbot */}
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
      
    </div>
  );
};
