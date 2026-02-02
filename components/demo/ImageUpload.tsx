"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Upload, FileImage, Trash2, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const STORAGE_KEY = "dnd-demo-images";

export function ImageUpload() {
  const [images, setImages] = useState<UploadedFile[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved images", e);
        return [];
      }
    }
    return [];
  });
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  }, [images]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback((files: FileList | File[]) => {
    let hasError = false;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        hasError = true;
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Files must be smaller than 2MB.");
        hasError = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const newImage: UploadedFile = {
          id: Math.random().toString(36).substring(2, 11),
          name: file.name,
          size: file.size,
          type: file.type,
          url,
        };
        setImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    if (!hasError) setError(null);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const resetImages = () => {
    setImages([]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Upload Images</h2>
          <p className="text-sm text-zinc-500">Drag and drop images up to 2MB each</p>
        </div>
        <button
          onClick={resetImages}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center text-center gap-4",
          isDragging
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]"
            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
        )}
      >
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
          isDragging ? "bg-blue-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
        )}>
          <Upload className="w-8 h-8" />
        </div>
        <div>
          <p className="text-lg font-medium">
            {isDragging ? "Drop images here" : "Click or drag images here to upload"}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            Supports JPG, PNG, WebP up to 2MB
          </p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
          }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <AnimatePresence initial={false}>
          {images.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
              className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border"
            >
              <Image
                src={image.url}
                alt={image.name}
                fill
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                <p className="text-white text-xs font-medium truncate w-full mb-1">
                  {image.name}
                </p>
                <p className="text-white/70 text-[10px] mb-3">
                  {formatSize(image.size)}
                </p>
                <button
                  onClick={() => removeImage(image.id)}
                  className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {images.length === 0 && !error && (
        <div className="text-center py-12 text-zinc-400 border border-dashed rounded-3xl">
          <FileImage className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
