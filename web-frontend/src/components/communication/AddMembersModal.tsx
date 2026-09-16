'use client';

import React, { useState } from 'react';
import { X, Search, UserPlus, Check } from 'lucide-react';
import { useCommunication } from '../../context/CommunicationContext';
import { useAuth } from '../../context/AuthContext';

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  currentParticipants: string[]; // array of employee IDs
}

export const AddMembersModal: React.FC<AddMembersModalProps> = ({ 
  isOpen, 
  onClose, 
  conversationId, 
  currentParticipants 
}) => {
  const { employees, addMembersToGroup } = useCommunication();
  const { user } = useAuth();
  
  const [searchMember, setSearchMember] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Filter out employees who are already in the group or the current user
  const availableEmployees = employees.filter(
    (e) => 
      e.id !== user?.id && 
      e.id !== user?._id?.toString() &&
      !currentParticipants.includes(e.id) &&
      (e.name.toLowerCase().includes(searchMember.toLowerCase()) || 
       e.designation?.toLowerCase().includes(searchMember.toLowerCase()))
  );

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
    if (selectedMembers.size === 0) return;
    
    setIsSubmitting(true);
    try {
      await addMembersToGroup(conversationId, Array.from(selectedMembers));
      onClose();
      setSelectedMembers(new Set());
      setSearchMember('');
    } catch (error) {
      console.error('Failed to add members:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-500" />
            Add Members to Group
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Search Members */}
          <div className="relative mb-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or designation..."
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1 mt-3 border border-zinc-100 dark:border-zinc-800/60 rounded-xl p-1 bg-zinc-50/50 dark:bg-zinc-950/20 h-64 overflow-y-auto">
            {availableEmployees.length > 0 ? (
              availableEmployees.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => toggleMember(emp.id)}
                  className={`flex w-full items-center justify-between rounded-lg p-2.5 text-left transition-colors ${
                    selectedMembers.has(emp.id)
                      ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500/20'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random`}
                      alt={emp.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900"
                    />
                    <div>
                      <p className={`text-sm font-semibold ${
                        selectedMembers.has(emp.id) ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'
                      }`}>
                        {emp.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">{emp.designation}</p>
                    </div>
                  </div>
                  {selectedMembers.has(emp.id) && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-zinc-500">
                No new members found.
              </div>
            )}
          </div>
          <div className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-500 text-right">
            {selectedMembers.size} member(s) selected
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedMembers.size === 0 || isSubmitting}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Members'}
          </button>
        </div>
      </div>
    </div>
  );
};
