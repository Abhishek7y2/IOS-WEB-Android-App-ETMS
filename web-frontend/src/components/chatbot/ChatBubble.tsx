import React from 'react';
import { Sparkles, User } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

export const ChatBubble = ({ role, content, timestamp }: { role: string; content: string; timestamp: string }) => {
  const isUser = role === 'user';
  const isSystem = role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full font-medium">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex flex-row items-start gap-4 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        
        {/* Avatar - Only for AI */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-white border border-zinc-200 text-zinc-900 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
            <Sparkles size={16} />
          </div>
        )}
        
        {/* Message Content */}
        <div className={`flex flex-col gap-1 flex-1 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`text-[15px] pt-1 ${isUser ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-5 py-3.5 rounded-3xl rounded-tr-sm shadow-sm' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {isUser ? (
              <div className="whitespace-pre-wrap leading-relaxed font-normal">{content}</div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800">
                <MarkdownRenderer content={content} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
