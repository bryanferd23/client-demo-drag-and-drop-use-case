import { GallerySort } from "@/components/demo/GallerySort";

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
          Arrangeable Gallery
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          A responsive grid layout for managing visual assets. Uses a rectangle sorting 
          strategy to allow intuitive reordering in both horizontal and vertical directions.
        </p>
      </div>

      <GallerySort />
    </div>
  );
}