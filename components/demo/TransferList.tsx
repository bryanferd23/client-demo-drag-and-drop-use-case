"use client";

import React, { useState, useEffect, useRef } from "react";
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
        "flex items-center justify-between bg-white dark:bg-zinc-800 p-3 rounded-xl border shadow-sm transition-all",
        isDragging ? "opacity-50" : "hover:border-zinc-300 dark:hover:border-zinc-700"
      )}
    >
      <div className="flex items-center gap-3">
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium">{item.label}</span>
      </div>
      {container === "available" ? (
        <ArrowRight className="w-3.5 h-3.5 text-zinc-300" />
      ) : (
        <ArrowLeft className="w-3.5 h-3.5 text-zinc-300" />
      )}
    </div>
  );
}

export function TransferList() {
  const [data, setData] = useState<TransferData>(SEED_DATA);
  const [activeId, setActiveId] = useState<string | null>(null);
  const isLoaded = useRef(false);

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
    isLoaded.current = true;
  }, []);

  useEffect(() => {
    if (isLoaded.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

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
    const overContainer = findContainer(overId as string);

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
      newOverItems.splice(overIndex >= 0 ? overIndex : newOverItems.length, 0, movedItem);

      return {
        ...prev,
        [activeContainer]: newActiveItems,
        [overContainer]: newOverItems,
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over?.id as string);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const activeIndex = data[activeContainer].findIndex((i) => i.id === active.id);
      const overIndex = data[overContainer].findIndex((i) => i.id === over?.id);

      if (activeIndex !== overIndex) {
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
          <h2 className="text-xl font-semibold">Tech Stack Selector</h2>
          <p className="text-sm text-zinc-500">Drag items to select them for your project</p>
        </div>
        <button
          onClick={resetData}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset Lists
        </button>
      </div>

      <DndContext
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
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Available</h3>
              <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border">
                {data.available.length}
              </span>
            </div>
            <div className="bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl p-4 border min-h-[400px]">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Search available..."
                  className="w-full bg-white dark:bg-zinc-800 border rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <SortableContext
                id="available"
                items={data.available.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {data.available.map((item) => (
                    <SortableItem key={item.id} item={item} container="available" />
                  ))}
                  {data.available.length === 0 && (
                    <div className="py-12 text-center text-zinc-400 text-sm italic">
                      All items selected
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          </div>

          {/* Selected List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Selected</h3>
              <span className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30">
                {data.selected.length}
              </span>
            </div>
            <div className="bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/20 min-h-[400px]">
              <SortableContext
                id="selected"
                items={data.selected.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {data.selected.map((item) => (
                    <SortableItem key={item.id} item={item} container="selected" />
                  ))}
                  {data.selected.length === 0 && (
                    <div className="py-12 text-center text-zinc-400 text-sm italic">
                      No items selected yet
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeId && activeItem ? (
            <div className="flex items-center justify-between bg-white dark:bg-zinc-800 p-3 rounded-xl border border-blue-500 shadow-2xl scale-105 opacity-90 cursor-grabbing w-[300px]">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{activeItem.label}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}