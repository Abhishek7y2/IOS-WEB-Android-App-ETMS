'use client';
import React, { useState, useMemo } from 'react';
import { useChat } from '../../context/ChatContext';
import { Search, ChevronDown, List, Grid, Folder, FileText, Image as ImageIcon } from 'lucide-react';

export const LibraryView = () => {
  const { libraries, chatHistory, loadConversation } = useChat();
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'documents'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter based on search query
  const filteredLibraries = useMemo(() => {
    if (!libraries) return [];
    return libraries.filter(lib => lib.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [libraries, searchQuery]);

  const filteredChats = useMemo(() => {
    if (!chatHistory) return [];
    return chatHistory.filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [chatHistory, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 px-8 py-10 max-w-5xl mx-auto w-full">
      
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-medium text-zinc-900 dark:text-zinc-100">Library</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 rounded-full text-sm outline-none w-64 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
            New <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex items-center justify-between mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('all')}
            className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${activeTab === 'all' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveTab('images')}
            className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${activeTab === 'images' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
          >
            Images
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${activeTab === 'documents' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
          >
            Documents
          </button>
        </div>
        <div className="flex items-center gap-4 text-zinc-600">
          <button className="hover:text-zinc-900 dark:hover:text-zinc-100"><List size={18} /></button>
          <button className="hover:text-zinc-900 dark:hover:text-zinc-100"><Grid size={18} /></button>
          <button className="hover:text-zinc-900 dark:hover:text-zinc-100 ml-2"><List size={18} /></button>
        </div>
      </div>

      {/* Table Header */}
      <div className="flex items-center text-xs font-medium text-zinc-600 mb-2 px-2">
        <div className="flex-1">Name</div>
        <div className="w-48 flex items-center gap-1">Modified <ChevronDown size={12} /></div>
        <div className="w-24">Size</div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          
          {activeTab === 'all' && (
            <>
              {/* Render Folders (Libraries) */}
              {filteredLibraries.map(lib => (
                <div key={lib._id} className="flex items-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 p-2 rounded-lg cursor-pointer transition-colors border-b border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-400">
                      <Folder size={16} />
                    </div>
                    <span className="text-sm text-zinc-800 dark:text-zinc-200">{lib.name}</span>
                  </div>
                  <div className="w-48 text-xs text-zinc-600">
                    Today
                  </div>
                  <div className="w-24 text-xs text-zinc-600">
                    —
                  </div>
                </div>
              ))}

              {/* Render Chats (As if they were files) */}
              {filteredChats.map(chat => (
                <div key={chat._id} className="flex items-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 p-2 rounded-lg cursor-pointer transition-colors border-b border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-400">
                       <FileText size={16} />
                    </div>
                    <span className="text-sm text-zinc-800 dark:text-zinc-200 truncate pr-4">{chat.title}</span>
                  </div>
                  <div className="w-48 text-xs text-zinc-600">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="w-24 text-xs text-zinc-600">
                    —
                  </div>
                </div>
              ))}

              {filteredLibraries.length === 0 && filteredChats.length === 0 && (
                <div className="py-10 text-center text-sm text-zinc-600">
                   {searchQuery ? 'No results found for your search.' : 'Your library is empty.'}
                </div>
              )}
            </>
          )}

          {activeTab === 'images' && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-500">
                 <ImageIcon size={32} />
               </div>
               <h3 className="text-zinc-900 dark:text-zinc-100 font-medium mb-1">Image Search</h3>
               <p className="text-sm text-zinc-600 max-w-sm">
                 You haven't uploaded or generated any images yet. Use the chat to generate images and they will appear here.
               </p>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-500">
                 <FileText size={32} />
               </div>
               <h3 className="text-zinc-900 dark:text-zinc-100 font-medium mb-1">Document Search</h3>
               <p className="text-sm text-zinc-600 max-w-sm">
                 You haven't uploaded any documents yet. Upload PDFs or text files in the chat to see them here.
               </p>
            </div>
          )}
          
        </div>
      </div>

    </div>
  );
};
