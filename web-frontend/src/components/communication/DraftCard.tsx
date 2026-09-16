'use client';

import React from 'react';
import { Clock, Edit3, Trash2, Send } from 'lucide-react';
import { Draft } from '../../types/communication';
import { formatRelativeTime, getPriorityColor } from '../../utils/communicationUtils';

interface DraftCardProps {
  draft: Draft;
  onEdit?: () => void;
  onDelete?: () => void;
  onSend?: () => void;
}

export const DraftCard: React.FC<DraftCardProps> = ({ draft, onEdit, onDelete, onSend }) => {
  return (
    <div className="group rounded-2xl border border-zinc-200/60 bg-white p-4 transition-all duration-300 hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-950/40 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Draft</span>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${getPriorityColor(draft.priority)}`}>
              {draft.priority}
            </span>
          </div>
          <h3 className="mt-1.5 text-base font-bold text-zinc-950 dark:text-zinc-50 truncate">{draft.subject || 'Untitled'}</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">{draft.content || 'No content yet...'}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(draft.updatedAt)}
            </span>
            {draft.toNames.length > 0 && (
              <span>To: {draft.toNames.join(', ')}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {onEdit && (
            <button onClick={onEdit} className="rounded-lg p-1.5 text-zinc-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 transition-colors" title="Edit">
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          )}
          {onSend && (
            <button onClick={onSend} className="rounded-lg p-1.5 text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 transition-colors" title="Send">
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors" title="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};