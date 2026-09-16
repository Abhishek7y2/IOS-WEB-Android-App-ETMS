import React, { useRef, useState } from 'react';
import { Send, Plus, X, FileText } from 'lucide-react';

export const ChatInput = ({ onSend, disabled }: { onSend: (msg: string) => void; disabled: boolean }) => {
  const [text, setText] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || attachedFile) && !disabled) {
      // In the new architecture, we just pass the attachment as an object to onSend
      // instead of injecting it into the text string, but we can serialize it temporarily
      // or modify onSend signature. We'll encode it as JSON for easy extraction, or simply
      // rely on the Context to handle a JSON string if we don't want to break the interface.
      let finalMessage = text;
      
      if (attachedFile) {
        // We embed the file data in a custom token block so the Context can parse it out
        finalMessage = `[ATTACHMENT:${JSON.stringify(attachedFile)}]${text}`;
      }
      
      onSend(finalMessage);
      setText('');
      setAttachedFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      // dataUrl looks like "data:image/png;base64,iVBORw0KGgo..."
      const [header, base64Data] = dataUrl.split(',');
      const mimeMatch = header.match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : file.type;
      
      setAttachedFile({ name: file.name, content: base64Data, mimeType });
    };
    reader.readAsDataURL(file);
    
    // Reset the input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto flex flex-col gap-2 relative">
        
        {/* Attached File Badge */}
        {attachedFile && (
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm w-fit">
            <FileText size={16} />
            <span className="font-medium truncate max-w-[200px]">{attachedFile.name}</span>
            <button 
              onClick={() => setAttachedFile(null)}
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-center bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 rounded-3xl shadow-md focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all px-2 py-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="shrink-0 p-2 rounded-full text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Attach file"
          >
            <Plus size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".txt,.md,.json,.csv,.pdf,image/png,image/jpeg,image/webp" 
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI Assistant anything..."
            className="w-full bg-transparent border-none py-3 px-2 text-[15px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none resize-none h-[48px] overflow-hidden leading-tight"
            disabled={disabled}
            rows={1}
          />
          <button
            type="submit"
            disabled={(!text.trim() && !attachedFile) || disabled}
            className={`shrink-0 p-2 rounded-full transition-all flex items-center justify-center h-9 w-9 ${(!text.trim() && !attachedFile) ? 'text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800' : 'text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'} disabled:cursor-not-allowed`}
          >
            <Send size={16} className={(!text.trim() && !attachedFile) ? "" : "ml-0.5"} />
          </button>
        </form>
      </div>
    </div>
  );
};
