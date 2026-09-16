'use client';

import React, { useEffect, useState } from 'react';
import { X, CalendarDays, UserRound, AlertTriangle, ShieldCheck, FileText, Paperclip, Download, Image as ImageIcon, Table, Eye, ExternalLink } from 'lucide-react';
import { Employee, Task, TaskAttachment } from '../../types';
import { formatDate } from '../../utils/format';
import { StatusBadge } from './StatusBadge';

interface TaskDetailsModalProps {
  isOpen: boolean;
  task: Task | null;
  employees: Employee[];
  onClose: () => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-300 border-green-300 dark:border-green-700 font-bold shadow-sm',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-bold shadow-sm',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold shadow-sm',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-300 border-red-300 dark:border-red-700 font-bold shadow-sm',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-300 border-red-300 dark:border-red-700 font-bold shadow-sm',
};

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ isOpen, task, employees, onClose }) => {
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewAttachment) setPreviewAttachment(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previewAttachment, onClose]);

  if (!isOpen || !task) return null;

  const assignee = employees.find((emp) => emp.id === task.assignedTo);

  const openDocumentBlobInNewTab = (att: TaskAttachment) => {
    try {
      const arr = att.dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || att.type || 'application/octet-stream';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch {
      window.open(att.dataUrl, '_blank');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/95 transition-all duration-300 animate-in fade-in zoom-in-95 font-sans">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-zinc-150 dark:border-zinc-800/60 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Task Details</h3>
                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Reference ID: {task.id}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-snug">{task.title}</h4>
            </div>

            {/* Description */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/40 dark:bg-zinc-950/20">
              <p className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-2">Description</p>
              <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {task.description || 'No description provided for this task.'}
              </p>
            </div>

            {/* Grid Metadata */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3.5 dark:border-zinc-800/40 dark:bg-zinc-950/10">
                <UserRound className="h-5 w-5 text-zinc-500 dark:text-zinc-500" />
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Assigned To</p>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate mt-0.5">
                    {assignee ? assignee.name : 'Unassigned'}
                  </p>
                  {assignee?.designation && (
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-semibold">{assignee.designation}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3.5 dark:border-zinc-800/40 dark:bg-zinc-950/10">
                <CalendarDays className="h-5 w-5 text-zinc-500 dark:text-zinc-500" />
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Due Date</p>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3.5 dark:border-zinc-800/40 dark:bg-zinc-950/10">
                <AlertTriangle className="h-5 w-5 text-zinc-500 dark:text-zinc-500" />
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Priority</p>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold mt-1 ${priorityColors[task.priority]}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3.5 dark:border-zinc-800/40 dark:bg-zinc-950/10">
                <ShieldCheck className="h-5 w-5 text-zinc-500 dark:text-zinc-500" />
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── ATTACHED DOCUMENTS & FILES SECTION ── */}
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-2.5 mb-3">
                <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  Attached Documents & Files
                </p>
                <span className="rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/40 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                  {task.attachments && task.attachments.length > 0 ? `${task.attachments.length} File(s)` : '0 Files'}
                </span>
              </div>

              {task.attachments && task.attachments.length > 0 ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {task.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900/90 shadow-2xs hover:border-teal-600 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 shrink-0">
                          {att.name.toLowerCase().endsWith('.pdf') ? (
                            <FileText className="h-4.5 w-4.5 text-red-500" />
                          ) : att.name.toLowerCase().endsWith('.csv') || att.name.toLowerCase().endsWith('.xls') || att.name.toLowerCase().endsWith('.xlsx') ? (
                            <Table className="h-4.5 w-4.5 text-emerald-600" />
                          ) : att.type.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(att.name) ? (
                            <ImageIcon className="h-4.5 w-4.5 text-purple-600" />
                          ) : (
                            <Paperclip className="h-4.5 w-4.5 text-teal-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate">{att.name}</p>
                          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500">{(att.size / 1024).toFixed(1)} KB • {att.type.split('/')[1]?.toUpperCase() || 'DOCUMENT'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* View In-App Lightbox Button */}
                        <button
                          type="button"
                          onClick={() => setPreviewAttachment(att)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 text-[11px] font-bold text-teal-800 dark:text-teal-300 transition cursor-pointer border border-teal-200/60 dark:border-teal-800/40"
                          title="View Document Preview"
                        >
                          <Eye className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                          <span>View</span>
                        </button>

                        {/* Download CTA */}
                        <a
                          href={att.dataUrl}
                          download={att.name}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-[11px] font-bold text-white transition cursor-pointer shadow-xs"
                          title="Download File"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/20">
                  <Paperclip className="h-6 w-6 text-zinc-400 dark:text-zinc-600 mb-1.5" />
                  <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">No Attached Documents</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5">No files or PDF documents were attached when this task was created.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── REDESIGNED CLOSE DETAILS BUTTON FOOTER ── */}
          <div className="border-t border-zinc-150 dark:border-zinc-800/60 pt-4 mt-6 flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 text-xs font-bold text-white shadow-md hover:shadow-teal-700/25 active:scale-95 transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>Close Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── IN-APP DOCUMENT PREVIEW LIGHTBOX MODAL ── */}
      {previewAttachment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={() => setPreviewAttachment(null)} />
          <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden font-sans">
            {/* Lightbox Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950">
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="h-5 w-5 text-teal-600 shrink-0" />
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{previewAttachment.name}</span>
                <span className="text-xs text-zinc-500 font-medium">({(previewAttachment.size / 1024).toFixed(1)} KB)</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openDocumentBlobInNewTab(previewAttachment)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-teal-600" />
                  <span>Open in Tab</span>
                </button>
                <a
                  href={previewAttachment.dataUrl}
                  download={previewAttachment.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-xs font-bold text-white transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1.5 rounded-xl text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Content Viewer */}
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center min-h-[400px] max-h-[75vh] bg-zinc-100 dark:bg-zinc-950">
              {previewAttachment.type.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(previewAttachment.name) ? (
                <img
                  src={previewAttachment.dataUrl}
                  alt={previewAttachment.name}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                />
              ) : previewAttachment.name.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewAttachment.dataUrl}
                  title={previewAttachment.name}
                  className="w-full h-full min-h-[500px] rounded-lg border border-zinc-200 dark:border-zinc-800"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <FileText className="h-12 w-12 text-teal-600" />
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{previewAttachment.name}</p>
                  <p className="text-xs text-zinc-500">Document preview ready for download or tab opening.</p>
                  <a
                    href={previewAttachment.dataUrl}
                    download={previewAttachment.name}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 text-xs font-bold text-white shadow-md hover:bg-teal-800 transition"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download File</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
