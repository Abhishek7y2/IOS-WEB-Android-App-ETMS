'use client';
import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Search, MessageSquarePlus, MessageSquare } from 'lucide-react';

import { ChatItem } from './ChatSidebar';

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString();
};

export const ProjectDetailView = ({ onOpenChat }: { onOpenChat: () => void }) => {
  const { projects, activeProjectId, loadConversation, startNewChat } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const project = projects.find(p => p._id === activeProjectId);

  if (!project) {
    return <div className="p-8 text-zinc-600">Project not found.</div>;
  }

  const filteredChats = project.chats?.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col h-full bg-[#FAF9F7] dark:bg-zinc-950 px-8 py-10 max-w-5xl mx-auto w-full">
      
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-medium text-zinc-900 dark:text-zinc-100" style={{ fontFamily: 'Georgia, serif' }}>{project.name}</h1>
          <p className="text-zinc-600 text-sm mt-1">{project.chats?.length || 0} chats</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              startNewChat(project._id);
              onOpenChat();
            }}
            className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <MessageSquarePlus size={16} />
            New chat in project
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Search in project..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-blue-400 dark:border-zinc-700 rounded-lg text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-zinc-800 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex flex-col gap-1 w-full max-w-3xl">
          {filteredChats.length === 0 ? (
            <div className="text-center text-zinc-600 mt-10">No chats found in this project.</div>
          ) : (
            filteredChats.map(chat => (
              <ChatItem key={chat._id} chat={chat} onOpenChat={onOpenChat} />
            ))
          )}
        </div>
      </div>

    </div>
  );
};
