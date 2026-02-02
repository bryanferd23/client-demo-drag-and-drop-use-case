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
import { GripVertical, RefreshCcw, CheckCircle2 } from "lucide-react";
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
        "flex items-center gap-4 bg-card p-4 rounded-2xl border border-border transition-all hover:border-primary/20",
        isDragging ? "opacity-50 grayscale" : "hover:shadow-md"
      )}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-1"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors",
        item.completed 
          ? "border-primary bg-primary text-primary-foreground" 
          : "border-muted-foreground/30 text-transparent"
      )}>
        <CheckCircle2 className="w-4 h-4" />
      </div>

      <div className="flex-grow">
        <h3 className={cn(
          "font-semibold text-sm transition-colors", 
          item.completed ? "text-muted-foreground line-through decoration-muted-foreground/50" : "text-foreground"
        )}>
          {item.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.description}
        </p>
      </div>
    </div>
  );
}

export function ListSorting() {
  const [items, setItems] = useState<ListItem[]>(SEED_DATA);
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
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Today&apos;s Tasks</h2>
          <p className="text-sm text-muted-foreground">Reorder tasks based on priority</p>
        </div>
        <button
          onClick={resetItems}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset List
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
            <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-primary/30 shadow-2xl scale-105 cursor-grabbing ring-1 ring-primary/10">
              <GripVertical className="w-5 h-5 text-primary" />
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center border-2",
                activeItem.completed ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
              )}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-sm text-foreground">
                  {activeItem.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
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
