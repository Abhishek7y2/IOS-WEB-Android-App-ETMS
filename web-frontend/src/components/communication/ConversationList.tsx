'use client';

import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Conversation, CommunicationFilters } from '../../types/communication';
import { ConversationItem } from './ConversationItem';
import { EmptyState } from '../ui/EmptyState';
import { useCommunication } from '../../context/CommunicationContext';
import { useAuth } from '../../context/AuthContext';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  onArchive?: (id: string) => void;
  onPin?: (id: string) => void;
  filters: CommunicationFilters;
  onFilterChange: (filters: Partial<CommunicationFilters>) => void;
  onResetFilters: () => void;
  title: string;
  showSearch?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  onArchive,
  onPin,
  filters,
  onFilterChange,
  onResetFilters,
  title,
  showSearch = true,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);
  const { employees, startDirectConversation } = useCommunication();
  const { user } = useAuth();
  const currentUserId = user?.id || 'emp-1';

  // Find employees we don't have a direct conversation with yet
  const chattedEmployeeIds = new Set<string>();
  conversations.forEach((c) => {
    if (c.type === 'direct' && c.participants.length === 2) {
      const otherId = c.participants.find((p) => p !== currentUserId);
      if (otherId) chattedEmployeeIds.add(otherId);
    }
  });

  let unchattedEmployees = employees.filter(
    (e) => !chattedEmployeeIds.has(e.id) && e.id !== currentUserId && e.id !== user?._id?.toString()
  );

  // Apply search filter to unchatted employees
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    unchattedEmployees = unchattedEmployees.filter(
      (e) => e.name.toLowerCase().includes(searchLower) || (e.designation || '').toLowerCase().includes(searchLower)
    );
  }

  // Generate dummy conversations for unchatted employees
  const unchattedConversations: Conversation[] = unchattedEmployees.map((emp) => ({
    id: `new-${emp.id}`,
    type: 'direct',
    subject: `Chat with ${emp.name}`,
    priority: 'medium',
    status: 'sent',
    participants: [currentUserId, emp.id],
    participantNames: [user?.name || 'You', emp.name],
    participantAvatars: [user?.profilePicture || '', emp.profilePicture],
    lastMessage: 'Tap to start conversation',
    lastMessageTime: new Date().toISOString(),
    lastMessageSender: '',
    unreadCount: 0,
    isRead: true,
    isPinned: false,
    isArchived: false,
    hasAttachments: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: currentUserId,
  }));

  const allConversations = [...conversations, ...unchattedConversations];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-zinc-200/60 px-4 py-3 dark:border-zinc-800/60">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50 font-outfit">{title}</h2>
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100/50 dark:border-blue-900/50 px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              {conversations.length}
            </span>
          </div>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="mt-2.5 relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search messages..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full rounded-xl border border-zinc-200/60 bg-zinc-50/50 py-2 pl-9 pr-9 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-800 dark:focus:ring-blue-950/50"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="mt-2.5 space-y-2 rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-3 dark:border-zinc-800/60 dark:bg-zinc-900/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Filters</span>
              <button onClick={onResetFilters} className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Reset All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filters.priority}
                onChange={(e) => onFilterChange({ priority: e.target.value as any })}
                className="rounded-lg border border-zinc-200/60 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-800/60 dark:bg-zinc-900 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={filters.dateRange}
                onChange={(e) => onFilterChange({ dateRange: e.target.value as any })}
                className="rounded-lg border border-zinc-200/60 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-800/60 dark:bg-zinc-900 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.unreadOnly}
                onChange={(e) => onFilterChange({ unreadOnly: e.target.checked })}
                className="h-3 w-3 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700"
              />
              Unread only
            </label>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {allConversations.length > 0 ? (
          allConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isSelected={selectedId === conv.id}
              onClick={() => {
                if (conv.id.startsWith('new-')) {
                  const empId = conv.id.replace('new-', '');
                  startDirectConversation(empId);
                } else {
                  onSelect(conv);
                }
              }}
              onArchive={onArchive && !conv.id.startsWith('new-') ? () => onArchive(conv.id) : undefined}
              onPin={onPin && !conv.id.startsWith('new-') ? () => onPin(conv.id) : undefined}
            />
          ))
        ) : (
          <div className="pt-8">
            <EmptyState
              title="No conversations"
              message="No messages match your current filters. Try adjusting your search or filters."
              onClearFilters={onResetFilters}
            />
          </div>
        )}
      </div>
    </div>
  );
};