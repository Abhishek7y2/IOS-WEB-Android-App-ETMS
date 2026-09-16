'use client';

import React from 'react';
import { Pin, Trash2, Megaphone, Clock, Eye, Edit2 } from 'lucide-react';
import { Announcement } from '../../types/communication';
import { formatRelativeTime, getPriorityColor } from '../../utils/communicationUtils';

interface AnnouncementCardProps {
  announcement: Announcement;
  onPin?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, onPin, onEdit, onDelete, isAdmin }) => {
  return (
    <div className={`group rounded-2xl border bg-white p-5 transition-all duration-300 hover:shadow-md dark:bg-zinc-950/40 backdrop-blur-sm ${
      announcement.isPinned ? 'border-blue-200/60 dark:border-blue-900/40 ring-1 ring-blue-100/50 dark:ring-blue-950/30' : 'border-zinc-200/60 dark:border-zinc-800/60'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {announcement.isPinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                <Pin className="h-2.5 w-2.5" /> Pinned
              </span>
            )}
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${getPriorityColor(announcement.priority)}`}>
              {announcement.priority}
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-500">
              <Eye className="h-3 w-3" /> {announcement.readBy.length} views
            </span>
          </div>
          <h3 className="mt-2 text-base font-bold text-zinc-950 dark:text-zinc-50">{announcement.title}</h3>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">{announcement.description}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
            <span className="flex items-center gap-1">
              <Megaphone className="h-3 w-3" />
              {announcement.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(announcement.publishDate)}
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {onPin && (
              <button onClick={onPin} className={`rounded-lg p-1.5 transition-colors ${announcement.isPinned ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`} title={announcement.isPinned ? 'Unpin' : 'Pin'}>
                <Pin className="h-3.5 w-3.5" />
              </button>
            )}
            {onEdit && (
              <button onClick={onEdit} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Edit">
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors" title="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};