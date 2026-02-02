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
import { GripVertical, Plus, MoreHorizontal, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Task {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface BoardData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

const SEED_DATA: BoardData = {
  tasks: {
    "task-1": { id: "task-1", content: "Research DnD libraries" },
    "task-2": { id: "task-2", content: "Implement basic board" },
    "task-3": { id: "task-3", content: "Add drag overlay" },
    "task-4": { id: "task-4", content: "Persist state to localStorage" },
    "task-5": { id: "task-5", content: "Add keyboard accessibility" },
    "task-6": { id: "task-6", content: "Refine UI styling" },
  },
  columns: {
    "todo": {
      id: "todo",
      title: "To Do",
      taskIds: ["task-4", "task-5", "task-6"],
    },
    "doing": {
      id: "doing",
      title: "In Progress",
      taskIds: ["task-2", "task-3"],
    },
    "done": {
      id: "done",
      title: "Done",
      taskIds: ["task-1"],
    },
  },
  columnOrder: ["todo", "doing", "done"],
};

const STORAGE_KEY = "dnd-demo-trello";

// Components
function SortableTask({ id, task }: { id: string; task: Task }) {
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
      className={cn(
        "group relative bg-white dark:bg-zinc-800 p-4 rounded-xl border shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700",
        isDragging && "opacity-50 grayscale"
      )}
    >
      <div className="flex items-start gap-3">
        <div 
          {...attributes} 
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 flex-grow">
          {task.content}
        </p>
      </div>
    </div>
  );
}

function ColumnContainer({ column, tasks }: { column: Column; tasks: Task[] }) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col w-full min-w-[300px] bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl p-4 border"
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          {column.title}
          <span className="text-xs font-normal text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border">
            {tasks.length}
          </span>
        </h3>
        <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <SortableContext
        items={column.taskIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3 min-h-[100px]">
          {tasks.map((task) => (
            <SortableTask key={task.id} id={task.id} task={task} />
          ))}
        </div>
      </SortableContext>

      <button className="mt-4 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors px-2">
        <Plus className="w-4 h-4" />
        Add card
      </button>
    </div>
  );
}

export function TrelloBoard() {
  const [board, setBoard] = useState<BoardData>(SEED_DATA);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const isLoaded = useRef(false);

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
        setBoard(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
    isLoaded.current = true;
  }, []);

  useEffect(() => {
    if (isLoaded.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
    }
  }, [board]);

  function findColumnOfTask(taskId: string) {
    if (!board) return null;
    return Object.values(board.columns).find((col) =>
      col.taskIds.includes(taskId)
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnOfTask(activeId);
    const overColumn = board.columns[overId] || findColumnOfTask(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setBoard((prev) => {
      if (!prev) return prev;

      const newColumns = { ...prev.columns };
      
      // Remove from old column
      newColumns[activeColumn.id] = {
        ...activeColumn,
        taskIds: activeColumn.taskIds.filter((id) => id !== activeId),
      };

      // Add to new column
      const overIndex = overColumn.taskIds.indexOf(overId);
      const newIndex = overIndex >= 0 ? overIndex : overColumn.taskIds.length;
      
      newColumns[overColumn.id] = {
        ...overColumn,
        taskIds: [
          ...overColumn.taskIds.slice(0, newIndex),
          activeId,
          ...overColumn.taskIds.slice(newIndex),
        ],
      };

      return { ...prev, columns: newColumns };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnOfTask(activeId);
    const overColumn = board.columns[overId] || findColumnOfTask(overId);

    if (!activeColumn || !overColumn || activeColumn !== overColumn) return;

    const activeIndex = activeColumn.taskIds.indexOf(activeId);
    const overIndex = overColumn.taskIds.indexOf(overId);

    if (activeIndex !== overIndex) {
      setBoard((prev) => {
        if (!prev) return prev;
        const newColumns = { ...prev.columns };
        newColumns[activeColumn.id] = {
          ...activeColumn,
          taskIds: arrayMove(activeColumn.taskIds, activeIndex, overIndex),
        };
        return { ...prev, columns: newColumns };
      });
    }
  }

  const resetBoard = () => {
    setBoard(SEED_DATA);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Project Board</h2>
          <p className="text-sm text-zinc-500">Drag tasks between columns to update status</p>
        </div>
        <button
          onClick={resetBoard}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset Board
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {board.columnOrder.map((columnId) => {
            const column = board.columns[columnId];
            const tasks = column.taskIds.map((id) => board.tasks[id]);

            return (
              <ColumnContainer
                key={columnId}
                column={column}
                tasks={tasks}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTaskId ? (
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border shadow-xl w-[280px] rotate-2 cursor-grabbing">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-zinc-400">
                  <GripVertical className="w-4 h-4" />
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {board.tasks[activeTaskId].content}
                </p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}