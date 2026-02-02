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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, RefreshCcw, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const SEED_DATA: ListItem[] = [
  { id: "1", title: "Complete project proposal", description: "Draft the initial scope and goals", completed: true },
  { id: "2", title: "Review UI designs", description: "Check accessibility and mobile responsiveness", completed: false },
  { id: "3", title: "Implement Auth", description: "Set up Clerk or NextAuth", completed: false },
  { id: "4", title: "Write unit tests", description: "Focus on core business logic", completed: false },
  { id: "5", title: "Deploy to Vercel", description: "Set up environment variables", completed: false },
  { id: "6", title: "Gather feedback", description: "Interview beta users", completed: false },
];

const STORAGE_KEY = "dnd-demo-list-sorting";

function SortableItem({ item }: { item: ListItem }) {
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
        "flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border transition-all",
        isDragging ? "opacity-50 border-blue-500 shadow-xl z-50" : "hover:border-zinc-300 dark:hover:border-zinc-700"
      )}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center border-2",
        item.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-zinc-200 dark:border-zinc-800"
      )}>
        {item.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 text-zinc-200 dark:text-zinc-800" />}
      </div>

      <div className="flex-grow">
        <h3 className={cn("font-semibold text-sm", item.completed && "text-zinc-400 line-through")}>
          {item.title}
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          {item.description}
        </p>
      </div>
    </div>
  );
}

export function ListSorting() {
  const [items, setItems] = useState<ListItem[]>(() => {
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
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Today&apos;s Tasks</h2>
          <p className="text-sm text-zinc-500">Reorder tasks based on priority</p>
        </div>
        <button
          onClick={resetItems}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset List
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
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && activeItem ? (
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-blue-500 shadow-2xl scale-105 opacity-90 cursor-grabbing">
              <GripVertical className="w-5 h-5 text-blue-500" />
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center border-2",
                activeItem.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-zinc-200 dark:border-zinc-800"
              )}>
                {activeItem.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 text-zinc-200 dark:text-zinc-800" />}
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-sm">
                  {activeItem.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {activeItem.description}
                </p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
