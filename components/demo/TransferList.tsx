"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ArrowRight, ArrowLeft, RefreshCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  label: string;
}

interface TransferData {
  available: Item[];
  selected: Item[];
}

const SEED_DATA: TransferData = {
  available: [
    { id: "react", label: "React.js" },
    { id: "nextjs", label: "Next.js" },
    { id: "tailwind", label: "Tailwind CSS" },
    { id: "typescript", label: "TypeScript" },
    { id: "framer", label: "Framer Motion" },
    { id: "dndkit", label: "@dnd-kit" },
    { id: "lucide", label: "Lucide Icons" },
    { id: "shadcn", label: "Shadcn UI" },
  ],
  selected: [
    { id: "node", label: "Node.js" },
  ],
};

const STORAGE_KEY = "dnd-demo-transfer";

function SortableItem({ item, container }: { item: Item; container: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    data: { container }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between bg-card p-3 rounded-xl border border-border transition-all hover:border-primary/20 hover:shadow-sm",
        isDragging ? "opacity-50 grayscale" : "cursor-default"
      )}
    >
      <div className="flex items-center gap-3">
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-1 touch-none select-none"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-foreground">{item.label}</span>
      </div>
      {container === "available" ? (
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
      ) : (
        <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
      )}
    </div>
  );
}

function DroppableList({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn("min-h-full w-full", className)}>
      {children}
    </div>
  );
}

export function TransferList() {
  const [data, setData] = useState<TransferData>(SEED_DATA);
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
        setData(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  function findContainer(id: string) {
    if (id in data) return id as keyof TransferData;
    if (data.available.some((item) => item.id === id)) return "available";
    if (data.selected.some((item) => item.id === id)) return "selected";
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = overId in data ? overId as keyof TransferData : findContainer(overId as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setData((prev) => {
      if (!prev) return prev;
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      
      const activeIndex = activeItems.findIndex((i) => i.id === active.id);
      const overIndex = overItems.findIndex((i) => i.id === overId);

      const newActiveItems = [...activeItems];
      const [movedItem] = newActiveItems.splice(activeIndex, 1);

      const newOverItems = [...overItems];
      // If over an empty container (overId is the container ID), overIndex will be -1
      const insertIndex = overIndex >= 0 ? overIndex : newOverItems.length;
      newOverItems.splice(insertIndex, 0, movedItem);

      return {
        ...prev,
        [activeContainer]: newActiveItems,
        [overContainer]: newOverItems,
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId) {
      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(active.id as string);
    const overContainer = overId in data ? overId as keyof TransferData : findContainer(overId as string);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const activeIndex = data[activeContainer].findIndex((i) => i.id === active.id);
      const overIndex = data[overContainer].findIndex((i) => i.id === overId);

      if (activeIndex !== overIndex && overIndex >= 0) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
          };
        });
      }
    }

    setActiveId(null);
  }

  const resetData = () => {
    setData(SEED_DATA);
    localStorage.removeItem(STORAGE_KEY);
  };

  const activeItem = activeId 
    ? [...data.available, ...data.selected].find((i) => i.id === activeId) 
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Tech Stack Selector</h2>
          <p className="text-sm text-muted-foreground">Drag items to select them for your project</p>
        </div>
        <button
          onClick={resetData}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset Lists
        </button>
      </div>

      <DndContext
        id={id}
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Available List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Available</h3>
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full border border-border font-mono">
                {data.available.length}
              </span>
            </div>
            <div className="bg-secondary/30 backdrop-blur-sm p-4 border border-border min-h-[450px] flex flex-col relative overflow-hidden">
              <div className="relative mb-4 z-10">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search available..."
                  className="w-full bg-background border border-border py-2 pl-9 pr-4 text-sm focus:border-primary/50 outline-none placeholder:text-muted-foreground/50 transition-all font-mono"
                />
              </div>
              <DroppableList id="available" className="flex-grow flex flex-col gap-2 relative z-0">
                <SortableContext
                  id="available"
                  items={data.available.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {data.available.map((item) => (
                    <SortableItem key={item.id} item={item} container="available" />
                  ))}
                  {data.available.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12 text-center">
                      <p className="text-muted-foreground/40 text-sm font-serif italic italic">
                        All items selected
                      </p>
                    </div>
                  )}
                </SortableContext>
              </DroppableList>
            </div>
          </div>

          {/* Selected List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Selected</h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-mono">
                {data.selected.length}
              </span>
            </div>
            <div className="bg-secondary/30 backdrop-blur-sm p-4 border border-border min-h-[450px] flex flex-col relative overflow-hidden">
              <DroppableList id="selected" className="flex-grow flex flex-col gap-2 relative z-0">
                <SortableContext
                  id="selected"
                  items={data.selected.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {data.selected.map((item) => (
                    <SortableItem key={item.id} item={item} container="selected" />
                  ))}
                  {data.selected.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12 text-center">
                      <p className="text-muted-foreground/40 text-sm font-serif italic italic">
                        No items selected yet
                      </p>
                    </div>
                  )}
                </SortableContext>
              </DroppableList>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeId && activeItem ? (
            <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-primary/30 shadow-2xl scale-105 cursor-grabbing w-[300px] ring-1 ring-primary/10">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{activeItem.label}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
