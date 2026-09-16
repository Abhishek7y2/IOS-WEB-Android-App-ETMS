'use client';

import React from 'react';
import { Bot, User, Clock, Check, CheckCheck, Reply } from 'lucide-react';
import { Message } from '../../types/communication';
import { formatRelativeTime } from '../../utils/communicationUtils';
import { AttachmentPreview } from './AttachmentPreview';

interface MessageBubbleProps {
  message: Message;
  isOwn?: boolean;
  onReply?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, onReply }) => {
  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isOwn ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}>
        {isOwn ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`max-w-[75%] space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{message.senderName}</span>
          <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-500">
            <Clock className="h-2.5 w-2.5" />
            {formatRelativeTime(message.timestamp)}
          </span>
        </div>
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isOwn
            ? 'bg-blue-600 text-white dark:bg-blue-700 rounded-br-md'
            : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 rounded-bl-md'
        }`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-1.5 space-y-1.5">
            {message.attachments.map((att) => (
              <AttachmentPreview key={att.id} attachment={att} compact />
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          {isOwn && (
            <span className="text-zinc-500 dark:text-zinc-500">
              {message.status === 'read' ? <CheckCheck className="h-3 w-3 text-blue-500" /> : <Check className="h-3 w-3" />}
            </span>
          )}
          {onReply && (
            <button onClick={onReply} className="text-xs text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-0.5">
              <Reply className="h-2.5 w-2.5" /> Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};