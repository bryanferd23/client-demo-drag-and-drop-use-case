"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RefreshCcw, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface GalleryItem {
  id: string;
  url: string;
  title: string;
}

const SEED_DATA: GalleryItem[] = [
  { id: "1", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80", title: "Forest" },
  { id: "2", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80", title: "Sunlight" },
  { id: "3", url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80", title: "Mountains" },
  { id: "4", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", title: "Lake" },
  { id: "5", url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80", title: "Path" },
  { id: "6", url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80", title: "Nature" },
  { id: "7", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", title: "Canyon" },
  { id: "8", url: "https://images.unsplash.com/photo-1532274402911-5a3b027c1bb7?auto=format&fit=crop&w=800&q=80", title: "Valley" },
];

const STORAGE_KEY = "dnd-demo-gallery";

function SortablePhoto({ item }: { item: GalleryItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border group",
        isDragging ? "opacity-0" : "cursor-grab active:cursor-grabbing"
      )}
      {...attributes}
      {...listeners}
    >
      <Image
        src={item.url}
        alt={item.title}
        fill
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        unoptimized
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
        <p className="text-white text-xs font-medium">{item.title}</p>
      </div>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md text-white">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

export function GallerySort() {
  const [items, setItems] = useState<GalleryItem[]>(() => {
    if (typeof window === "undefined") return SEED_DATA;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_DATA;
      }
    }
    return SEED_DATA;
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const resetItems = () => {
    setItems(SEED_DATA);
    localStorage.removeItem(STORAGE_KEY);
  };

  const activeItem = items.find((i) => i.id === activeId);

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Gallery Arrangement</h2>
          <p className="text-sm text-zinc-500">Drag images to reorder your collection</p>
        </div>
        <button
          onClick={resetItems}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset Gallery
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <SortablePhoto key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay adjustScale={true}>
          {activeId && activeItem ? (
            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-blue-500 shadow-2xl scale-105 opacity-90 cursor-grabbing z-50">
              <Image
                src={activeItem.url}
                alt={activeItem.title}
                fill
                className="w-full h-full object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/20 flex items-end p-4">
                <p className="text-white text-xs font-medium">{activeItem.title}</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

