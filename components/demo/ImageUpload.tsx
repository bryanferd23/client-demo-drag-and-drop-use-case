"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Upload, FileImage, Trash2, RefreshCcw, X } from "lucide-react";
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
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setImages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved images", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    }
  }, [images, isLoaded]);

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

  const handleContainerClick = () => {
    inputRef.current?.click();
  };

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
          <h2 className="text-xl font-semibold tracking-tight">Upload Images</h2>
          <p className="text-sm text-muted-foreground">Drag and drop images up to 2MB each</p>
        </div>
        <button
          onClick={resetImages}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto hover:text-destructive/80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={handleContainerClick}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-16 transition-all duration-300 flex flex-col items-center justify-center text-center gap-6 cursor-pointer group glass",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01] shadow-2xl"
            : "border-border hover:border-primary/50 hover:bg-secondary/30"
        )}
      >
        <div className={cn(
          "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
          isDragging ? "bg-primary text-primary-foreground scale-110" : "bg-secondary text-muted-foreground group-hover:scale-110 group-hover:bg-background"
        )}>
          <Upload className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <p className="text-xl font-medium text-foreground">
            {isDragging ? "Drop images now" : "Click or drag images to upload"}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports JPG, PNG, WebP up to 2MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <AnimatePresence initial={false}>
          {images.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              layout
              className="group relative aspect-square rounded-2xl overflow-hidden bg-secondary border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              <Image
                src={image.url}
                alt={image.name}
                fill
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4 text-center">
                <p className="text-white text-xs font-medium truncate w-full mb-1">
                  {image.name}
                </p>
                <p className="text-white/70 text-[10px] mb-3">
                  {formatSize(image.size)}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-destructive hover:border-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {images.length === 0 && !error && (
        <div className="text-center py-16 rounded-3xl border border-dashed border-border bg-secondary/20">
          <FileImage className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground font-medium">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}