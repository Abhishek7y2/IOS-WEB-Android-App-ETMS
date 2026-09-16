'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Paperclip, FileText, Image as ImageIcon, Table, X, UploadCloud, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { TaskAttachment } from '../../types';

const convertFileToAttachment = (file: File): Promise<TaskAttachment> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || 'file',
        dataUrl: reader.result as string,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

interface AttachmentPanelProps {
  attachments: TaskAttachment[];
  onAddAttachments: (newAtts: TaskAttachment[]) => void;
  onRemoveAttachment: (id: string) => void;
}

export const AttachmentPanel: React.FC<AttachmentPanelProps> = ({
  attachments,
  onAddAttachments,
  onRemoveAttachment,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments: TaskAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds maximum allowed size of 10MB.`);
        continue;
      }
      try {
        const att = await convertFileToAttachment(file);
        newAttachments.push(att);
      } catch {
        toast.error(`Failed to attach file "${file.name}".`);
      }
    }

    onAddAttachments(newAttachments);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments: TaskAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds maximum allowed size of 10MB.`);
        continue;
      }
      try {
        const att = await convertFileToAttachment(file);
        newAttachments.push(att);
      } catch {
        toast.error(`Failed to attach file "${file.name}".`);
      }
    }

    onAddAttachments(newAttachments);
    setIsUploading(false);
  };

  const triggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getCsvPreviewText = (dataUrl: string) => {
    try {
      const base64Data = dataUrl.split(',')[1];
      if (!base64Data) return '';
      // Decode base64 to utf-8 string (handles non-latin characters cleanly)
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(bytes);
    } catch {
      return 'Unable to decode file preview.';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Centered Minimal Clean Dropzone box */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFilePicker}
        className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 hover:border-teal-600 dark:hover:border-teal-500 hover:bg-teal-50/20 dark:hover:bg-teal-950/10 cursor-pointer transition w-full text-center"
      >
        <UploadCloud className="h-8 w-8 text-teal-600 dark:text-teal-400 mb-2" />
        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
          {isUploading ? 'Uploading...' : 'Browse Files'}
        </span>
        <span className="text-[10px] text-zinc-550 dark:text-zinc-500 mt-1">
          Drag and drop files here
        </span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,.xls,.xlsx,.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,image/*,text/csv,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Inline Preview List */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between gap-3 p-2.5 border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl hover:bg-zinc-100/50 dark:hover:bg-zinc-900/60 transition group relative"
            >
              <div
                onClick={() => setPreviewAttachment(att)}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                title="Click to preview file"
              >
                {/* File Thumbnail / File Type Icons */}
                {att.type.startsWith('image/') ? (
                  <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 relative">
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Eye className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                ) : att.name.endsWith('.pdf') ? (
                  <div className="h-9 w-9 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/45 flex items-center justify-center shrink-0 relative">
                    <FileText className="h-5 w-5 text-red-500" />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 rounded-lg transition flex items-center justify-center">
                      <Eye className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-200" />
                    </div>
                  </div>
                ) : att.name.endsWith('.csv') ||
                  att.name.endsWith('.xls') ||
                  att.name.endsWith('.xlsx') ? (
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/45 flex items-center justify-center shrink-0 relative">
                    <Table className="h-5 w-5 text-emerald-600" />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 rounded-lg transition flex items-center justify-center">
                      <Eye className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-200" />
                    </div>
                  </div>
                ) : (
                  <div className="h-9 w-9 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/45 flex items-center justify-center shrink-0 relative">
                    <Paperclip className="h-5 w-5 text-teal-600" />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 rounded-lg transition flex items-center justify-center">
                      <Eye className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-200" />
                    </div>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition" title={att.name}>
                    {att.name}
                  </div>
                  <div className="text-[9.5px] text-zinc-550 font-semibold mt-0.5 flex items-center gap-1.5">
                    <span>{(att.size / 1024).toFixed(1)} KB</span>
                    <span className="text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition font-bold text-[9px] uppercase tracking-wider">Preview</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemoveAttachment(att.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition shrink-0 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Popup Preview Modal Overlay */}
      {previewAttachment && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-150 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950">
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate" title={previewAttachment.name}>
                  Preview: {previewAttachment.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-700 dark:hover:text-zinc-300 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Preview Container */}
            <div className="p-5 overflow-auto bg-zinc-50/20 dark:bg-zinc-900/10 flex-1 flex flex-col items-center justify-center min-h-[300px]">
              {previewAttachment.type.startsWith('image/') ? (
                <img
                  src={previewAttachment.dataUrl}
                  alt={previewAttachment.name}
                  className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800"
                />
              ) : previewAttachment.name.endsWith('.pdf') ? (
                <iframe
                  src={previewAttachment.dataUrl}
                  className="w-full h-[65vh] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white shadow-sm"
                  title="PDF Document Preview"
                />
              ) : previewAttachment.name.endsWith('.csv') ||
                previewAttachment.name.endsWith('.txt') ? (
                <div className="w-full text-left bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-4 rounded-xl overflow-auto max-h-[65vh] custom-scrollbar shadow-inner">
                  <pre className="text-xs font-mono leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                    {getCsvPreviewText(previewAttachment.dataUrl)}
                  </pre>
                </div>
              ) : (
                /* Premium Card fallback for spreadsheet/docs */
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-zinc-250 dark:border-zinc-800 rounded-xl space-y-4 bg-white dark:bg-zinc-950 shadow-sm max-w-sm text-center">
                  <div className="h-16 w-16 rounded-2xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center border border-teal-100 dark:border-teal-900/50">
                    <Table className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[250px]">{previewAttachment.name}</p>
                    <p className="text-[10px] text-zinc-550 font-semibold">{(previewAttachment.size / 1024).toFixed(1)} KB ({previewAttachment.type.split('/').pop()?.toUpperCase() || 'FILE'})</p>
                  </div>
                  <p className="text-[11px] text-zinc-550 leading-normal">
                    This file format does not support inline browser previews. Download to inspect locally.
                  </p>
                  <a
                    href={previewAttachment.dataUrl}
                    download={previewAttachment.name}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-md shadow-teal-700/10"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
