'use client';

import React from 'react';
import { FileText, Image, FileSpreadsheet, Archive, File, X } from 'lucide-react';
import { Attachment } from '../../types/communication';
import { formatFileSize } from '../../utils/communicationUtils';

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove?: () => void;
  compact?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  image: <Image className="h-4 w-4" />,
  pdf: <FileText className="h-4 w-4" />,
  docx: <FileText className="h-4 w-4" />,
  excel: <FileSpreadsheet className="h-4 w-4" />,
  zip: <Archive className="h-4 w-4" />,
  other: <File className="h-4 w-4" />,
};

const colorMap: Record<string, string> = {
  image: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30',
  pdf: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30',
  docx: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
  excel: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30',
  zip: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30',
  other: 'text-zinc-600 bg-zinc-50 dark:text-zinc-400 dark:bg-zinc-900/30',
};

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachment, onRemove, compact }) => {
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium border ${colorMap[attachment.type] || colorMap.other} border-current/10`}>
        {iconMap[attachment.type] || iconMap.other}
        <span className="truncate max-w-[100px]">{attachment.name}</span>
        {onRemove && <button onClick={onRemove} className="ml-1 hover:text-red-500 transition-colors"><X className="h-2.5 w-2.5" /></button>}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200/60 bg-white p-3 transition-all duration-300 hover:shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/40">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[attachment.type] || colorMap.other}`}>{iconMap[attachment.type] || iconMap.other}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">{attachment.name}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">{formatFileSize(attachment.size)}</p>
      </div>
      {onRemove && <button onClick={onRemove} className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"><X className="h-3.5 w-3.5" /></button>}
    </div>
  );
};