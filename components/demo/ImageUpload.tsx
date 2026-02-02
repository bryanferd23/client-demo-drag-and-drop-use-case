"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Upload, Trash2, RefreshCcw, X } from "lucide-react";
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
    <div className="w-full max-w-5xl mx-auto space-y-12">
      <header className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-primary mb-2">Asset Upload</h2>
          <p className="text-sm font-sans uppercase tracking-widest text-muted-foreground">
            Dropzone / Validation / Preview
          </p>
        </div>
        <button
          onClick={resetImages}
          className="editorial-button flex items-center gap-2"
        >
          <RefreshCcw className="w-3 h-3" />
          Reset System
        </button>
      </header>

      {error && (
        <div className="flex items-center gap-4 p-4 border border-destructive bg-destructive/5 text-destructive font-mono text-xs uppercase tracking-wide">
          <div className="w-2 h-2 bg-destructive" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto hover:text-foreground">
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
          "relative border-2 border-dashed p-24 transition-all duration-500 flex flex-col items-center justify-center text-center gap-8 cursor-pointer group bg-secondary/30",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary hover:bg-secondary/50"
        )}
      >
        <div className="w-24 h-24 border border-border bg-background flex items-center justify-center group-hover:rotate-3 transition-transform duration-500 shadow-sm">
          <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="space-y-3">
          <p className="text-2xl font-serif italic text-foreground">
            {isDragging ? "Release to Upload" : "Drag assets here"}
          </p>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            JPG — PNG — WEBP — Max 2MB
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <AnimatePresence initial={false}>
          {images.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
              className="group relative aspect-[3/4] bg-secondary border border-border p-2 hover:-translate-y-2 transition-transform duration-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0)] hover:shadow-[8px_8px_0px_0px_var(--color-border)]"
            >
              <div className="relative w-full h-full bg-white overflow-hidden border border-border/50">
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                  unoptimized
                />
              </div>
              
              <div className="absolute inset-0 p-4 bg-primary/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center gap-3">
                <div className="overflow-hidden w-full">
                  <p className="font-mono text-xs truncate text-white font-bold tracking-tight">
                    {image.name}
                  </p>
                  <p className="font-mono text-[10px] text-white/70">
                    {formatSize(image.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className="bg-destructive text-white hover:bg-white hover:text-destructive px-4 py-2 transition-all duration-300 w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold border border-transparent hover:border-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {images.length === 0 && !error && (
        <div className="flex items-center justify-center py-24 border border-border bg-secondary/10">
          <div className="text-center space-y-4">
            <div className="w-12 h-[1px] bg-border mx-auto" />
            <p className="font-serif italic text-muted-foreground">No artifacts selected.</p>
            <div className="w-12 h-[1px] bg-border mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
}