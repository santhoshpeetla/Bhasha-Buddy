"use client";

import React, { useRef, useState, useEffect } from "react";
import { Upload, FileText, X, AlertCircle, FileImage } from "lucide-react";
import { MAX_FILE_BYTES } from "@/lib/security";

interface DocumentUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  selectedFile: File | null;
  clearFile: () => void;
}

const ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "webp"];

export default function DocumentUploader({
  onFileSelect,
  isLoading,
  selectedFile,
  clearFile
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL on unmount to prevent leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateAndSelectFile = (file: File) => {
    setError(null);

    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      setError("Unsupported file format. Please upload PDF, PNG, JPG, JPEG, or WEBP.");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setError("File is too large. Max size allowed is 20MB.");
      return;
    }

    // Create thumbnail preview if image
    const isImg = ["png", "jpg", "jpeg", "webp"].includes(extension);
    if (isImg) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    clearFile();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isImage = selectedFile && ["png", "jpg", "jpeg", "webp"].includes(selectedFile.name.split(".").pop()?.toLowerCase() || "");

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 min-h-[260px] group ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
              : "border-gray-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-gray-50/50 dark:hover:bg-zinc-900/60"
          }`}
          role="button"
          tabIndex={0}
          aria-label="Upload document"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              triggerFileInput();
            }
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            disabled={isLoading}
          />

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 mb-4 shadow-sm">
            <Upload className="h-6 w-6" />
          </div>

          <h3 className="text-lg font-bold tracking-tight text-gray-950 dark:text-zinc-50 mb-1.5">
            Upload document to decode
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-sm mb-4 leading-relaxed">
            Drag & drop your file here, or <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline decoration-2 decoration-indigo-200 dark:decoration-indigo-800">browse computer</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-950/50 px-4 py-2 rounded-full border border-gray-100 dark:border-zinc-800/80">
            <span>PDF, PNG, JPG, WEBP</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></span>
            <span>Up to 20MB</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></span>
            <span>Max 20 pages PDF</span>
          </div>

          {error && (
            <div className="absolute -bottom-16 left-0 right-0 flex items-center gap-2 p-3 text-sm rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-950/55 animate-fade-in">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex items-center justify-between shadow-soft animate-fade-in">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 overflow-hidden border border-gray-150 dark:border-zinc-850/30">
              {isImage && previewUrl ? (
                <img src={previewUrl} alt="Thumbnail Preview" className="h-full w-full object-cover" />
              ) : isImage ? (
                <FileImage className="h-6 w-6" />
              ) : (
                <FileText className="h-6 w-6" />
              )}
            </div>

            <div className="min-w-0 flex flex-col">
              <span className="text-sm font-bold text-gray-950 dark:text-zinc-50 truncate max-w-[200px] sm:max-w-[300px]" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                {formatSize(selectedFile.size)}
              </span>
            </div>
          </div>

          {!isLoading && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-850 text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200 transition-colors"
              aria-label="Remove uploaded file"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
