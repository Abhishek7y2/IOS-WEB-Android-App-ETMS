'use client';
import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Search } from 'lucide-react';

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

export const ArchiveView = ({ onOpenChat }: { onOpenChat: () => void }) => {
  const { archivedChats, loadConversation, toggleArchiveChat, deleteMultipleChats } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);

  const handleBulkDelete = async () => {
    if (selectedChats.length === 0) return;
    await deleteMultipleChats(selectedChats);
    handleCancel();
  };

  const handleBulkUnarchive = async () => {
    if (selectedChats.length === 0) return;
    for (const chatId of selectedChats) {
      await toggleArchiveChat(chatId);
    }
    handleCancel();
  };

  const filteredChats = archivedChats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedChats.length === filteredChats.length) {
      setSelectedChats([]);
    } else {
      setSelectedChats(filteredChats.map(c => c._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedChats(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleCancel = () => {
    setIsSelecting(false);
    setSelectedChats([]);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF9F7] dark:bg-zinc-950 px-8 py-10 max-w-5xl mx-auto w-full">
      
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-medium text-zinc-900 dark:text-zinc-100" style={{ fontFamily: 'Georgia, serif' }}>Archived Chats</h1>
        
        <div className="flex items-center gap-3">
          {isSelecting ? (
            <>
              <span className="text-sm text-zinc-600 mr-2">{selectedChats.length} selected</span>
              <button 
                onClick={handleSelectAll}
                className="text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {selectedChats.length === filteredChats.length && filteredChats.length > 0 ? 'Deselect all' : 'Select all'}
              </button>
              
              <button 
                disabled={selectedChats.length === 0}
                onClick={handleBulkUnarchive}
                className="text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Unarchive
              </button>
              <button 
                disabled={selectedChats.length === 0}
                onClick={handleBulkDelete}
                className="text-red-600 dark:text-red-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
              <button 
                onClick={handleCancel}
                className="text-zinc-700 dark:text-zinc-300 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsSelecting(true)}
                className="text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Select chats
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Search archived chats..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-blue-400 dark:border-zinc-700 rounded-lg text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-zinc-800 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex flex-col gap-1">
          {filteredChats.length === 0 ? (
            <div className="text-center text-zinc-600 mt-10">No archived chats found.</div>
          ) : (
            filteredChats.map(chat => (
              <div 
                key={chat._id} 
                onClick={() => {
                  if (isSelecting) {
                    toggleSelect(chat._id);
                  } else {
                    loadConversation(chat._id);
                    onOpenChat();
                  }
                }}
                className={`flex items-center justify-between py-3 px-2 rounded-lg cursor-pointer transition-colors group ${isSelecting ? 'hover:bg-transparent' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  {isSelecting && (
                    <input 
                      type="checkbox" 
                      checked={selectedChats.includes(chat._id)}
                      onChange={() => toggleSelect(chat._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer"
                    />
                  )}
                  <h4 className={`text-sm font-medium ${isSelecting ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white'}`}>{chat.title}</h4>
                </div>
                <span className="text-xs text-zinc-500">{formatTimeAgo(chat.updatedAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
