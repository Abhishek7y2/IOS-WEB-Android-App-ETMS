'use client';
import React, { useState } from 'react';
import { X, Sparkles, Lightbulb, ChevronDown } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export const CreateProjectModal = ({ onClose }: { onClose: () => void }) => {
  const [projectName, setProjectName] = useState('');
  const { createNewProject } = useChat();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!projectName.trim()) return;
    setIsSubmitting(true);
    await createNewProject(projectName.trim());
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#202123] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-transparent">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Create project</h2>
          <button onClick={onClose} className="p-2 text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 pt-2 space-y-6">
          
          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Project name</label>
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Copenhagen Trip"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#343541] border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-zinc-100 transition-shadow"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 bg-zinc-100 dark:bg-[#2A2B32] p-4 rounded-xl text-sm text-zinc-600 dark:text-zinc-400">
            <Lightbulb size={20} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Projects keep chats, files, and custom instructions in one place. Use them for ongoing work, or just to keep things tidy.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-zinc-100 dark:border-zinc-800/50">
          <button className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium">
            Default memory <ChevronDown size={16} />
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={!projectName.trim() || isSubmitting}
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            Create project
          </button>
        </div>

      </div>
    </div>
  );
};
