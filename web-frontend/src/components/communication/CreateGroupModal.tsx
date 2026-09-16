'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Users, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCommunication } from '../../context/CommunicationContext';
import { getTasks } from '../../api/tasks';
import { Task } from '../../types';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { employees, createGroup } = useCommunication();
  
  const [groupName, setGroupName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [searchMember, setSearchMember] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getTasks().then((res) => setTasks(res.tasks)).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    if (task && task.assignedTo) {
      const newSet = new Set(selectedMembers);
      const assignedId = task.assignedTo;
      if (assignedId && assignedId !== user?._id?.toString()) {
        newSet.add(assignedId);
      }
      setSelectedMembers(newSet);
    }
  }, [selectedTaskId, tasks]);

  if (!isOpen) return null;

  const toggleMember = (id: string) => {
    const newSet = new Set(selectedMembers);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedMembers(newSet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.size === 0) return;
    
    setIsSubmitting(true);
    try {
      await createGroup({
        groupName: groupName.trim(),
        participants: Array.from(selectedMembers),
        relatedTaskId: selectedTaskId || undefined,
        initialMessage: `Welcome to the ${groupName.trim()} group!`,
      });
      onClose();
      setGroupName('');
      setSelectedTaskId('');
      setSelectedMembers(newSet => { newSet.clear(); return newSet; });
      setSearchMember('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(
    (e) => 
      e.id !== user?.id && 
      e.id !== user?._id?.toString() &&
      (e.name.toLowerCase().includes(searchMember.toLowerCase()) || 
       e.designation?.toLowerCase().includes(searchMember.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Create New Group</h2>
          <button onClick={onClose} className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Group Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Frontend Team, Marketing Campaign"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Link to Task (Optional)</label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">-- No linked task --</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <span>Select Members <span className="text-red-500">*</span></span>
              <span className="text-xs font-medium text-zinc-500">{selectedMembers.size} selected</span>
            </label>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:focus:bg-zinc-900 dark:text-white"
              />
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-zinc-200 p-2 dark:border-zinc-800 space-y-1">
              {filteredEmployees.length === 0 ? (
                <div className="py-6 text-center text-sm text-zinc-500">No employees found</div>
              ) : (
                filteredEmployees.map((emp) => {
                  const isSelected = selectedMembers.has(emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => toggleMember(emp.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/20' 
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={emp.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'} 
                          alt={emp.name} 
                          className="h-8 w-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" 
                        />
                        <div>
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{emp.name}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">{emp.designation || 'Employee'}</div>
                        </div>
                      </div>
                      
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500' 
                          : 'border-zinc-300 dark:border-zinc-600'
                      }`}>
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !groupName.trim() || selectedMembers.size === 0}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};