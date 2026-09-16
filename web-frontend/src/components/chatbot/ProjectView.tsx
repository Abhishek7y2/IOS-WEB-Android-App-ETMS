'use client';
import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Search, ChevronDown, LayoutTemplate } from 'lucide-react';
import { CreateProjectModal } from './CreateProjectModal';

export const ProjectView = ({ onOpenProjectDetail }: { onOpenProjectDetail?: () => void }) => {
  const { projects, setActiveProject } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950 px-8 py-10 max-w-5xl mx-auto w-full">
        
        {/* Top Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-medium text-zinc-900 dark:text-zinc-100">Projects</h1>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Sort by <span className="font-semibold text-zinc-900 dark:text-zinc-100">Last updated</span> <ChevronDown size={14} />
            </button>
            <button 
              onClick={() => setIsProjectModalOpen(true)}
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              New project
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-16">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800/50 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* List Content or Empty State */}
        <div className="flex-1 overflow-y-auto">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center mt-20">
              <div className="mb-6 text-zinc-800">
                <LayoutTemplate size={48} strokeWidth={1} />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Looking to start a project?</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-sm mb-6 leading-relaxed">
                Upload materials, set custom Instructions, and organize conversations in one space.
              </p>
              <button 
                onClick={() => setIsProjectModalOpen(true)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                New project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <ProjectCard key={project._id} project={project} onOpenProjectDetail={onOpenProjectDetail} />
              ))}
            </div>
          )}
        </div>

      </div>
      
      {isProjectModalOpen && <CreateProjectModal onClose={() => setIsProjectModalOpen(false)} />}
    </>
  );
};

import { Edit2, MoreHorizontal, Pin, Archive, Trash } from 'lucide-react';

const ProjectCard = ({ project, onOpenProjectDetail }: { project: any, onOpenProjectDetail?: () => void }) => {
  const { setActiveProject, renameProject, togglePinProject, toggleArchiveProject, deleteProject } = useChat();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSaveRename = () => {
    if (editName.trim() && editName !== project.name) {
      renameProject(project._id, editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div 
      className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl hover:shadow-md dark:hover:shadow-zinc-900/50 transition-shadow cursor-pointer group"
      onClick={() => {
        if (!isEditing && !isMenuOpen) {
          setActiveProject(project._id);
          if (onOpenProjectDetail) onOpenProjectDetail();
        }
      }}
    >
      <div className="flex items-center justify-between mb-1">
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={editName}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename();
              if (e.key === 'Escape') {
                setEditName(project.name);
                setIsEditing(false);
              }
            }}
            onBlur={handleSaveRename}
            className="flex-1 min-w-0 bg-transparent outline-none border-b border-blue-500 font-medium text-zinc-900 mr-2"
          />
        ) : (
          <h4 className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            {project.isPinned && <Pin size={14} className="text-blue-500 fill-current" />}
            {project.name}
          </h4>
        )}
        
        {!isEditing && (
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded transition-all"
            >
              <MoreHorizontal size={16} />
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
        )}
      </div>
      <p className="text-xs text-zinc-600">{project.chats?.length || 0} chats</p>
    </div>
  );
};
