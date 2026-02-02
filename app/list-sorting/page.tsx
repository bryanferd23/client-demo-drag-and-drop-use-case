import { ListSorting } from "@/components/demo/ListSorting";

export default function ListSortingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
          List Sorting
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          A sleek, vertical list reordering experience. Focuses on simple item movements 
          with clear visual feedback and drag handles.
        </p>
      </div>

      <ListSorting />
    </div>
  );
}