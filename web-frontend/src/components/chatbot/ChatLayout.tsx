'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatWindow } from './ChatWindow';
import { ChatSidebar } from './ChatSidebar';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { LibraryView } from './LibraryView';
import { ProjectView } from './ProjectView';
import { ChatsListView } from './ChatsListView';
import { ArchiveView } from './ArchiveView';
import { ProjectDetailView } from './ProjectDetailView';
import { DocumentUpload } from '../rag/DocumentUpload';
import { DocumentChat } from '../rag/DocumentChat';

export const ChatLayout = () => {
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<'chat' | 'chats_list' | 'library' | 'project' | 'archive' | 'project_detail' | 'rag'>('chat');
  const [ragDocumentId, setRagDocumentId] = useState<string | null>(null);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'rag') {
      setCurrentView('rag');
    }
  }, [searchParams]);

  return (
    <div className="h-full w-full flex bg-white dark:bg-zinc-950 overflow-hidden relative">
      
      {/* Sidebar */}
      {isSidebarOpen && (
        <ChatSidebar 
          onClose={() => setIsSidebarOpen(false)} 
          onOpenLibrary={() => setCurrentView('library')}
          onOpenChat={() => setCurrentView('chat')}
          onOpenChatsList={() => setCurrentView('chats_list')}
          onOpenProjects={() => setCurrentView('project')}
          onOpenArchive={() => setCurrentView('archive')}
          onOpenProjectDetail={() => setCurrentView('project_detail')}
        />
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Top Header - Minimal */}
        <div className="flex-none h-14 px-4 flex items-center sticky top-0 z-10 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800/50 gap-3">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg transition-all"
              title="Open sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
          {currentView === 'chat' && (
            <div className="flex items-center gap-3">
               <span className="font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight text-sm">AI Assistant</span>
               <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-800/50">Enterprise</span>
            </div>
          )}
          {currentView === 'rag' && (
            <div className="flex items-center gap-3">
               <span className="font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight text-sm">Document Q&A</span>
               <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider border border-purple-100 dark:border-purple-800/50">Enterprise</span>
            </div>
          )}
        </div>
        
        {/* Main Interface */}
        <div className="flex-1 overflow-hidden relative">
          {currentView === 'chat' && <ChatWindow />}
          {currentView === 'chats_list' && <ChatsListView onOpenChat={() => setCurrentView('chat')} />}
          {currentView === 'library' && <LibraryView />}
          {currentView === 'project' && <ProjectView onOpenProjectDetail={() => setCurrentView('project_detail')} />}
          {currentView === 'archive' && <ArchiveView onOpenChat={() => setCurrentView('chat')} />}
          {currentView === 'project_detail' && <ProjectDetailView onOpenChat={() => setCurrentView('chat')} />}
          
          {currentView === 'rag' && (
            <div className="h-full w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
              {!ragDocumentId ? (
                <div className="max-w-2xl w-full">
                  <h2 className="text-xl font-semibold mb-6 text-center text-zinc-800 dark:text-zinc-200">Upload a PDF for RAG</h2>
                  <DocumentUpload 
                    onUploadSuccess={(docId) => setRagDocumentId(docId)} 
                  />
                </div>
              ) : (
                <div className="w-full h-full">
                  <DocumentChat documentId={ragDocumentId} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};
