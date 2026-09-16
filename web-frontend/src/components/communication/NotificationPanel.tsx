'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, Check, CheckCheck, MessageSquare, Megaphone, AtSign, RefreshCw } from 'lucide-react';
import { Notification } from '../../types/communication';
import { formatRelativeTime } from '../../utils/communicationUtils';

interface NotificationPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  unreadCount: number;
  anchorRef?: React.RefObject<HTMLDivElement | null>;
}

const notifIconMap: Record<string, React.ReactNode> = {
  new_message: <MessageSquare className="h-3.5 w-3.5" />,
  reply_received: <RefreshCw className="h-3.5 w-3.5" />,
  announcement: <Megaphone className="h-3.5 w-3.5" />,
  task_update: <Check className="h-3.5 w-3.5" />,
  mention: <AtSign className="h-3.5 w-3.5" />,
};

const notifColorMap: Record<string, string> = {
  new_message: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
  reply_received: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30',
  announcement: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30',
  task_update: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30',
  mention: 'text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/30',
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkRead,
  onMarkAllRead,
  unreadCount,
  anchorRef,
}) => {
  const [position, setPosition] = useState<{ top: number; right: number }>({ top: 0, right: 16 });

  // Calculate position based on anchor element
  useEffect(() => {
    if (!isOpen || !anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  const panel = (
    <>
      {/* Backdrop to close on outside click */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        className="fixed z-[9999] w-80 sm:w-96 rounded-2xl border border-zinc-200/60 bg-white shadow-2xl dark:border-zinc-800/60 dark:bg-zinc-950 max-h-[70vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 font-sans"
        style={{ top: `${position.top}px`, right: `${position.right}px` }}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Notifications</h3>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button onClick={onMarkAllRead} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30 transition-colors">
                <CheckCheck className="h-3 w-3" /> Mark all read
              </button>
            )}
            <button onClick={onClose} className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/60">
                <Bell className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
              </div>
              <p className="mt-3 text-sm font-bold text-zinc-600 dark:text-zinc-400">No notifications</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && onMarkRead(notif.id)}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
                    !notif.isRead
                      ? 'bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/10 dark:hover:bg-blue-950/20'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                  }`}
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${notifColorMap[notif.type] || notifColorMap.task_update}`}>
                    {notifIconMap[notif.type] || notifIconMap.task_update}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold truncate ${!notif.isRead ? 'text-zinc-950 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-400'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">{formatRelativeTime(notif.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Render via portal so it's not clipped by any parent overflow
  if (typeof window !== 'undefined') {
    return createPortal(panel, document.body);
  }
  return null;
};