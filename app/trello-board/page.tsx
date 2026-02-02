import { TrelloBoard } from "@/components/demo/TrelloBoard";

export default function TrelloBoardPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
          Trello Board
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          A multi-column task board with cross-container dragging. Move tasks between 
          lifecycle stages with smooth transitions and persistent state.
        </p>
      </div>

      <TrelloBoard />
    </div>
  );
}