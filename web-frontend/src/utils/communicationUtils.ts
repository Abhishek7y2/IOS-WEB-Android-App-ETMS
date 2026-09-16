export function formatRelativeTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatMessageTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/50';
    case 'medium':
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50';
    case 'low':
      return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-700/50';
    default:
      return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-700/50';
  }
}

export function getPriorityDot(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-blue-500';
    case 'low':
      return 'bg-zinc-500';
    default:
      return 'bg-zinc-500';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'sent':
      return 'text-blue-500';
    case 'delivered':
      return 'text-indigo-500';
    case 'read':
      return 'text-emerald-500';
    case 'unread':
      return 'text-orange-500';
    case 'replied':
      return 'text-violet-500';
    case 'archived':
      return 'text-zinc-500';
    default:
      return 'text-zinc-500';
  }
}

export function getAttachmentIcon(type: string): string {
  switch (type) {
    case 'image':
      return '🖼️';
    case 'pdf':
      return '📄';
    case 'docx':
      return '📝';
    case 'excel':
      return '📊';
    case 'zip':
      return '📦';
    default:
      return '📎';
  }
}

export function getNotificationIcon(type: string): string {
  switch (type) {
    case 'new_message':
      return '💬';
    case 'reply_received':
      return '↩️';
    case 'announcement':
      return '📢';
    case 'task_update':
      return '✅';
    case 'mention':
      return '👤';
    default:
      return '🔔';
  }
}

export function highlightMentions(content: string): string {
  return content.replace(/@(\w+\s?\w*)/g, '<span class="text-blue-600 dark:text-blue-400 font-semibold">@$1</span>');
}