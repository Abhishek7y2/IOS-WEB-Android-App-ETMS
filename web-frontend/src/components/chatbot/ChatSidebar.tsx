'use client';
import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { MessageSquarePlus, Library, Calendar, Folder, FileText, LayoutGrid, MessageSquare, PanelLeftClose, Plus, MoreHorizontal, Edit2, Trash, Archive, Pin, Check, X } from 'lucide-react';
import { CreateProjectModal } from './CreateProjectModal';

export const ChatSidebar = ({ onClose, onOpenLibrary, onOpenChat, onOpenProjects, onOpenChatsList, onOpenArchive, onOpenProjectDetail }: { onClose?: () => void, onOpenLibrary?: () => void, onOpenChat?: () => void, onOpenProjects?: () => void, onOpenChatsList?: () => void, onOpenArchive?: () => void, onOpenProjectDetail?: () => void }) => {
  const { chatHistory, loadConversation, startNewChat, conversationId, projects, addChatToProjectAction, setActiveProject } = useChat();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [visibleChatsCount, setVisibleChatsCount] = useState(6);

  return (
    <>
    <div className="w-64 h-full bg-zinc-50/80 dark:bg-zinc-950 border-r border-zinc-200/50 dark:border-zinc-800/50 flex flex-col shrink-0">
      <div className="p-3 flex items-center justify-between">
        <button
          onClick={() => {
            if (window.innerWidth < 768 && onClose) onClose();
          }}
          className="md:hidden p-2 text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
        >
          <PanelLeftClose size={20} />
        </button>
        <button
          onClick={onClose}
          className="hidden md:flex p-2 text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
          title="Close sidebar"
        >
          <PanelLeftClose size={20} />
        </button>
        <button
          onClick={() => {
            startNewChat();
            if (onOpenChat) onOpenChat();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-zinc-900 dark:text-zinc-100 font-medium text-xs ml-auto"
          title="New chat"
        >
          <MessageSquarePlus size={16} />
          <span className="hidden md:inline">New chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          {/* Main Navigation Links */}
          <div className="flex flex-col gap-1 mb-6">
            <SidebarLink icon={<MessageSquare size={18} />} text="Chats" onClick={onOpenChatsList} />
            <SidebarLink icon={<Folder size={18} />} text="Projects" onClick={onOpenProjects} />
            <SidebarLink icon={<Library size={18} />} text="Library" onClick={onOpenLibrary} />
            <SidebarLink icon={<Archive size={18} />} text="Archive" onClick={onOpenArchive} />
          </div>

          {/* Projects Section */}
          <div className="mb-6 group">
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="text-xs font-semibold text-zinc-600">Projects</h3>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setIsProjectModalOpen(true)}
                  className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  title="Create project"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              {projects.length === 0 ? (
                <div className="px-3 py-1 text-xs text-zinc-500">No projects yet</div>
              ) : (
                projects.map(project => (
                  <ProjectSidebarLink 
                    key={project._id} 
                    project={project} 
                    onDropChat={addChatToProjectAction}
                    onClick={() => {
                      setActiveProject(project._id);
                      if (onOpenProjectDetail) onOpenProjectDetail();
                      if (window.innerWidth < 768 && onClose) onClose();
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Recent Chats Section */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-zinc-600 mb-2">Recent Chats</h3>
            <div className="flex flex-col gap-1">
              {chatHistory.length === 0 ? (
                <div className="px-3 py-2 text-xs text-zinc-500">No recent chats</div>
              ) : (
                <>
                  {chatHistory.slice(0, visibleChatsCount).map((chat) => (
                    <ChatItem key={chat._id} chat={chat} onClose={onClose} onOpenChat={onOpenChat} />
                  ))}
                  {chatHistory.length > visibleChatsCount && (
                    <button 
                      onClick={() => setVisibleChatsCount(prev => prev + 6)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1.5 text-left transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      View More
                      <span className="text-zinc-400 group-hover:text-blue-500 transition-colors">↓</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
    {isProjectModalOpen && <CreateProjectModal onClose={() => setIsProjectModalOpen(false)} />}
    </>
  );
};

const SidebarLink = ({ icon, text, onClick }: { icon: React.ReactNode, text: string, onClick?: () => void }) => {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-sm font-medium truncate">
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{text}</span>
    </button>
  );
};

const ProjectSidebarLink = ({ project, onDropChat, onClick }: { project: any, onDropChat: (projectId: string, chatId: string) => void, onClick?: () => void }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { renameProject, deleteProject, togglePinProject, toggleArchiveProject, activeProjectId } = useChat();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = activeProjectId === project._id;

  const handleSaveRename = () => {
    if (editName.trim() && editName !== project.name) {
      renameProject(project._id, editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div 
      className={`relative group w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-sm text-left ${isActive ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'} ${isDragOver ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700' : 'border border-transparent'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const chatId = e.dataTransfer.getData('chatId');
        if (chatId) {
          onDropChat(project._id, chatId);
        }
      }}
    >
      <div 
        className="flex-1 flex items-center gap-2 truncate cursor-pointer py-0.5"
        onClick={(e) => {
          if (!isEditing && onClick) onClick();
        }}
      >
        {project.isPinned ? <Pin size={16} className="shrink-0 text-blue-500 fill-current" /> : <Folder size={16} className="shrink-0" />}
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename();
              if (e.key === 'Escape') {
                setEditName(project.name);
                setIsEditing(false);
              }
            }}
            onBlur={handleSaveRename}
            className="flex-1 min-w-0 bg-transparent outline-none border-b border-blue-500"
          />
        ) : (
          <span className="truncate">{project.name}</span>
        )}
      </div>

      {!isEditing && (
        <div className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isMenuOpen ? 'opacity-100' : ''}`}>
          <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" title="Rename">
            <Edit2 size={14} />
          </button>
          
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }} 
              className="p-1 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" 
              title="Options"
            >
              <MoreHorizontal size={14} />
            </button>
            
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}></div>
                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 py-1 text-xs">
                  <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left">
                    <Edit2 size={12} /> Rename
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); togglePinProject(project._id); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left">
                    <Pin size={12} /> {project.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toggleArchiveProject(project._id); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left">
                    <Archive size={12} /> Archive
                  </button>
                  <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1"></div>
                  <button onClick={(e) => { e.stopPropagation(); deleteProject(project._id); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-left">
                    <Trash size={12} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const ChatItem = ({ chat, onClose, onOpenChat }: { chat: any, onClose?: () => void, onOpenChat?: () => void }) => {
  const { loadConversation, conversationId, renameChat, togglePinChat, toggleArchiveChat, deleteMultipleChats, projects, addChatToProjectAction } = useChat();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProjectSubmenu, setShowProjectSubmenu] = useState(false);

  const handleSaveRename = () => {
    if (editTitle.trim() && editTitle !== chat.title) {
      renameChat(chat._id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const isActive = conversationId === chat._id;

  return (
    <div className={`relative group w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left ${isActive ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'}`}>
      <div 
        className="flex-1 flex items-center gap-2 truncate cursor-pointer py-0.5" 
        onClick={() => {
          if (!isEditing) {
            loadConversation(chat._id);
            if (onOpenChat) onOpenChat();
            if (window.innerWidth < 768 && onClose) onClose();
          }
        }}
        draggable={!isEditing}
        onDragStart={(e) => e.dataTransfer.setData('chatId', chat._id)}
      >
        {chat.isPinned ? <Pin size={16} className="shrink-0 text-blue-500 fill-current" /> : <MessageSquare size={16} className="shrink-0" />}
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename();
              if (e.key === 'Escape') {
                setEditTitle(chat.title);
                setIsEditing(false);
              }
            }}
            onBlur={handleSaveRename}
            className="flex-1 min-w-0 bg-transparent outline-none border-b border-blue-500"
          />
        ) : (
          <span className="truncate">{chat.title}</span>
        )}
      </div>

      {!isEditing && (
        <div className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isMenuOpen ? 'opacity-100' : ''}`}>
          <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" title="Rename">
            <Edit2 size={14} />
          </button>
          
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
                setShowProjectSubmenu(false);
              }} 
              className="p-1 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" 
              title="Options"
            >
              <MoreHorizontal size={14} />
            </button>
            
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}></div>
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 py-1 text-xs">
                  <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left">
                    <Edit2 size={12} /> Rename
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); togglePinChat(chat._id); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left">
                    <Pin size={12} /> {chat.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  
                  <div className="relative group/submenu">
                    <button 
                      onMouseEnter={() => setShowProjectSubmenu(true)}
                      onClick={(e) => { e.stopPropagation(); setShowProjectSubmenu(!showProjectSubmenu); }} 
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left"
                    >
                      <Folder size={12} /> Move to project
                    </button>
                    {showProjectSubmenu && (
                      <div className="absolute left-full top-0 ml-1 w-32 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1">
                        {projects.length === 0 ? (
                          <div className="px-3 py-1.5 text-zinc-600">No projects</div>
                        ) : (
                          projects.map(p => (
                            <button 
                              key={p._id}
                              onClick={(e) => {
                                e.stopPropagation();
                                addChatToProjectAction(p._id, chat._id);
                                setIsMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 truncate"
                            >
                              {p.name}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button onClick={(e) => { e.stopPropagation(); toggleArchiveChat(chat._id); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left">
                    <Archive size={12} /> Archive
                  </button>
                  <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1"></div>
                  <button onClick={(e) => { e.stopPropagation(); deleteMultipleChats([chat._id]); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-left">
                    <Trash size={12} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
