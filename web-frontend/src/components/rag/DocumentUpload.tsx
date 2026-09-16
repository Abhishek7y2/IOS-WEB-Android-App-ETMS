import React, { useRef, useState } from 'react';
import { FileUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadDocument } from '../../services/rag/ragApi';

interface DocumentUploadProps {
  onUploadSuccess: (documentId: string) => void;
}

export const DocumentUpload = ({ onUploadSuccess }: DocumentUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Component States
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // File selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  // Upload handler
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // API call to upload the document
      const response = await uploadDocument(file);
      
      const docId = response.data?.documentId || response.data?.document?._id;

      if (response.success && docId) {
        setSuccess(true);
        // Parent component ko naya documentId bhej rahe hain
        onUploadSuccess(docId);

        // Reset file input after 2 seconds
        setTimeout(() => {
          setFile(null);
          setSuccess(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 2000);
      } else {
        setError(response.message || 'Upload failed. Please try again.');
      }
    } catch (err: any) {
      console.error('DocumentUpload Error:', err);
      setError(err.message || 'A network error occurred while uploading.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
      <div className="flex flex-col gap-4">

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf"
        />

        {/* Dropzone / Upload Area */}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
            ${file ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <FileUp size={32} className={file ? 'text-blue-500' : 'text-zinc-500'} />
          <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {file ? file.name : 'Click to select a PDF document'}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">
            (Only .pdf files are supported)
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertCircle size={16} />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <CheckCircle2 size={16} />
            <p>Document uploaded and processed successfully!</p>
          </div>
        )}

        {/* Upload Button */}
        {file && !success && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing PDF...
              </>
            ) : (
              'Upload Document'
            )}
          </button>
        )}

      </div>
    </div>
  );
};
