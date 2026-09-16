'use client';
import React, { useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { Sparkles } from 'lucide-react';

export const ChatWindow = () => {
  const { messages, isLoading, sendMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto flex flex-col justify-end min-h-full px-4 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-800 dark:text-zinc-200 my-auto pb-32">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                 <Sparkles className="text-zinc-600" size={32} />
              </div>
              <h2 className="text-2xl font-medium mb-2">How can I help you today?</h2>
              <p className="text-sm text-zinc-600 mb-8">Ask about your tasks, team workload, or workspace updates.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  { title: "Pending Tasks", query: "Show me all my pending tasks" },
                  { title: "Team Members", query: "List all active team members in this workspace" },
                  { title: "Leave Requests", query: "Show me all pending leave requests" },
                  { title: "Today's Attendance", query: "Show today's attendance report for the team" },
                  { title: "Workload Analysis", query: "What is my team's current workload?" },
                  { title: "Admin Users", query: "Show admin users in the workspace" }
                ].map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(prompt.query)}
                    className="flex flex-col text-left p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all cursor-pointer group"
                  >
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{prompt.title}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate w-full">{prompt.query}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-10 pb-4 flex flex-col gap-6">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={bottomRef} className="h-4" />
            </div>
          )}
        </div>
      </div>
      
      {/* Input Area */}
      <div className="bg-gradient-to-t from-white via-white to-transparent dark:from-zinc-950 dark:via-zinc-950 pt-6 pb-6 px-4">
         <div className="max-w-3xl mx-auto">
            <ChatInput onSend={sendMessage} disabled={isLoading} />
            <div className="text-center mt-3">
               <p className="text-[11px] text-zinc-600">AI Assistant can make mistakes. Consider verifying important information.</p>
            </div>
         </div>
      </div>
    </div>
  );
};
