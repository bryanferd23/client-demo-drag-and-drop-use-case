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
  { id: "8", url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80", title: "Woods" },
];

const STORAGE_KEY = "dnd-demo-gallery-v2";

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
        "relative aspect-square rounded-2xl overflow-hidden bg-secondary border border-border group transition-all duration-300",
        isDragging ? "opacity-50 grayscale scale-95" : "hover:shadow-xl hover:border-primary/30 hover:scale-[1.02] cursor-grab active:cursor-grabbing",
        "touch-none select-none"
      )}
      {...attributes}
      {...listeners}
    >
      <Image
        src={item.url}
        alt={item.title}
        fill
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <p className="text-white text-xs font-medium translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{item.title}</p>
      </div>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-[-10px] group-hover:translate-y-0">
        <div className="p-1.5 rounded-lg bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

export function GallerySort() {
  const [items, setItems] = useState<GalleryItem[]>(SEED_DATA);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const id = React.useId();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

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
          <h2 className="text-xl font-semibold tracking-tight">Gallery Arrangement</h2>
          <p className="text-sm text-muted-foreground">Drag images to reorder your collection</p>
        </div>
        <button
          onClick={resetItems}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset Gallery
        </button>
      </div>

      <DndContext
        id={id}
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
            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-primary shadow-2xl scale-105 cursor-grabbing z-50 ring-4 ring-primary/10">
              <Image
                src={activeItem.url}
                alt={activeItem.title}
                fill
                className="w-full h-full object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white text-xs font-medium">{activeItem.title}</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
