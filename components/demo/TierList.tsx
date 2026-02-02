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
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Types
interface TierItem {
  id: string;
  url: string;
  title: string;
}

interface Tier {
  id: string;
  label: string;
  color: string;
  itemIds: string[];
}

interface TierData {
  items: Record<string, TierItem>;
  tiers: Record<string, Tier>;
  unrankedIds: string[];
}

const SEED_ITEMS: TierItem[] = [
  { id: "burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", title: "Burger" },
  { id: "pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80", title: "Pizza" },
  { id: "sushi", url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80", title: "Sushi" },
  { id: "taco", url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80", title: "Taco" },
  { id: "pasta", url: "https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=400&q=80", title: "Pasta" },
  { id: "salad", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80", title: "Salad" },
  { id: "steak", url: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80", title: "Steak" },
  { id: "icecream", url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80", title: "Ice Cream" },
  { id: "cake", url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80", title: "Cake" },
  { id: "donut", url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80", title: "Donut" },
];

const SEED_TIERS: Record<string, Tier> = {
  S: { id: "S", label: "S", color: "bg-red-500", itemIds: [] },
  A: { id: "A", label: "A", color: "bg-orange-500", itemIds: [] },
  B: { id: "B", label: "B", color: "bg-yellow-500", itemIds: [] },
  C: { id: "C", label: "C", color: "bg-green-500", itemIds: [] },
  D: { id: "D", label: "D", color: "bg-blue-500", itemIds: [] },
};

const getInitialData = (): TierData => ({
  items: SEED_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
  tiers: JSON.parse(JSON.stringify(SEED_TIERS)),
  unrankedIds: SEED_ITEMS.map((item) => item.id),
});

const STORAGE_KEY = "dnd-demo-tier-list";

// Components
function SortableTierItem({ id, item }: { id: string; item: TierItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative w-20 h-20 overflow-hidden border border-black/20 bg-white cursor-grab active:cursor-grabbing hover:z-10 transition-transform",
        isDragging && "opacity-50 grayscale"
      )}
    >
      <Image
        src={item.url}
        alt={item.title}
        fill
        className="object-cover"
        unoptimized
      />
      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-end p-1">
        <span className="text-[10px] text-white font-medium drop-shadow-md opacity-0 hover:opacity-100">{item.title}</span>
      </div>
    </div>
  );
}

function TierRow({ tier, items }: { tier: Tier; items: TierItem[] }) {
  const { setNodeRef } = useSortable({
    id: tier.id,
    data: {
      type: "Tier",
      tier,
    },
  });

  return (
    <div className="flex w-full min-h-[6rem] border-b border-black/10 last:border-b-0">
      <div 
        className={cn(
          "w-24 flex items-center justify-center text-3xl font-bold text-white shrink-0 border-r border-black/10",
          tier.color
        )}
      >
        {tier.label}
      </div>
      <div 
        ref={setNodeRef}
        className="flex-grow bg-zinc-900/90 p-2 flex flex-wrap gap-2 items-center min-h-[6rem]"
      >
        <SortableContext items={tier.itemIds} strategy={rectSortingStrategy}>
          {items.map((item) => (
            <SortableTierItem key={item.id} id={item.id} item={item} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function UnrankedPool({ itemIds, items }: { itemIds: string[]; items: Record<string, TierItem> }) {
  const { setNodeRef } = useSortable({
    id: "unranked",
    data: { type: "Unranked" },
  });

  return (
    <div 
      ref={setNodeRef}
      className="mt-8 p-6 bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl min-h-[10rem]"
    >
      <h3 className="text-sm font-semibold text-zinc-500 mb-4 uppercase tracking-wider">Unranked Items</h3>
      <div className="flex flex-wrap gap-3">
        <SortableContext items={itemIds} strategy={rectSortingStrategy}>
          {itemIds.map((id) => (
            <SortableTierItem key={id} id={id} item={items[id]} />
          ))}
        </SortableContext>
        {itemIds.length === 0 && (
          <div className="w-full text-center text-zinc-400 text-sm italic py-4">
            All items ranked!
          </div>
        )}
      </div>
    </div>
  );
}

export function TierList() {
  const [data, setData] = useState<TierData>(getInitialData());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const id = React.useId();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
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

  const resetData = () => {
    setData(getInitialData());
    localStorage.removeItem(STORAGE_KEY);
  };

  const findContainer = (state: TierData, id: string): string | undefined => {
    if (state.unrankedIds.includes(id)) return "unranked";
    return Object.keys(state.tiers).find((key) => state.tiers[key].itemIds.includes(id));
  };

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    setData((prev) => {
      const activeContainer = findContainer(prev, active.id as string);
      const isOverContainer = overId === "unranked" || overId in prev.tiers;
      const overContainer = isOverContainer
        ? (overId as string)
        : findContainer(prev, overId as string);

      if (!activeContainer || !overContainer || activeContainer === overContainer) {
        return prev;
      }

      const activeItems = activeContainer === "unranked" 
        ? prev.unrankedIds 
        : prev.tiers[activeContainer].itemIds;
      
      const overItems = overContainer === "unranked"
        ? prev.unrankedIds
        : prev.tiers[overContainer].itemIds;

      const activeIndex = activeItems.indexOf(active.id as string);
      const overIndex = isOverContainer 
        ? overItems.length + 1 
        : overItems.indexOf(overId as string);

      let newIndex;
      if (active.id in prev.tiers) {
        newIndex = overIndex;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      const newActiveItems = [...activeItems];
      const newOverItems = [...overItems];
      
      newActiveItems.splice(activeIndex, 1);
      newOverItems.splice(newIndex, 0, active.id as string);

      const newData = { ...prev, tiers: { ...prev.tiers } };
      
      if (activeContainer === "unranked") {
        newData.unrankedIds = newActiveItems;
      } else {
        newData.tiers[activeContainer] = {
          ...newData.tiers[activeContainer],
          itemIds: newActiveItems,
        };
      }

      if (overContainer === "unranked") {
        newData.unrankedIds = newOverItems;
      } else {
        newData.tiers[overContainer] = {
          ...newData.tiers[overContainer],
          itemIds: newOverItems,
        };
      }

      return newData;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId) {
      setActiveId(null);
      return;
    }

    setData((prev) => {
      const activeContainer = findContainer(prev, active.id as string);
      const overContainer = (overId === "unranked" || overId in prev.tiers)
        ? overId
        : findContainer(prev, overId as string);

      if (
        activeContainer &&
        overContainer &&
        activeContainer === overContainer
      ) {
        const items = activeContainer === "unranked" 
          ? prev.unrankedIds 
          : prev.tiers[activeContainer].itemIds;
          
        const activeIndex = items.indexOf(active.id as string);
        const overIndex = items.indexOf(overId as string);

        if (activeIndex !== overIndex) {
          const newData = { ...prev, tiers: { ...prev.tiers } };
          const newItems = arrayMove(items, activeIndex, overIndex);
          
          if (activeContainer === "unranked") {
            newData.unrankedIds = newItems;
          } else {
            newData.tiers[activeContainer] = {
              ...newData.tiers[activeContainer],
              itemIds: newItems,
            };
          }
          return newData;
        }
      }
      return prev;
    });

    setActiveId(null);
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Food Tier List</h2>
          <p className="text-sm text-zinc-500">Rank the items from S (Best) to D (Worst)</p>
        </div>
        <button
          onClick={resetData}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset
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
        <div className="flex flex-col border border-black/10 bg-black/5 dark:bg-zinc-950 overflow-hidden">
          {Object.values(data.tiers).map((tier) => (
            <TierRow 
              key={tier.id} 
              tier={tier} 
              items={tier.itemIds.map((id) => data.items[id])} 
            />
          ))}
        </div>

        <UnrankedPool 
          itemIds={data.unrankedIds} 
          items={data.items} 
        />

        <DragOverlay>
          {activeId ? (
            <div className="relative w-20 h-20 overflow-hidden border-2 border-blue-500 shadow-2xl scale-105 cursor-grabbing z-50">
              <Image
                src={data.items[activeId].url}
                alt={data.items[activeId].title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}