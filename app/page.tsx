import Link from "next/link";
import { 
  Image as ImageIcon, 
  Layout, 
  ListOrdered, 
  LayoutGrid, 
  ArrowLeftRight,
  ArrowRight
} from "lucide-react";

const demos = [
  {
    title: "Image Upload",
    description: "Upload images by dragging and dropping them into a dropzone. Preview and manage your uploads.",
    href: "/image-upload",
    icon: ImageIcon,
    color: "bg-blue-500",
  },
  {
    title: "Kanban Board",
    description: "Manage tasks across multiple columns. Drag cards between 'To Do', 'Doing', and 'Done'.",
    href: "/kanban-board",
    icon: Layout,
    color: "bg-purple-500",
  },
  {
    title: "List Sorting",
    description: "Reorder a simple list of items with smooth animations and drag handles.",
    href: "/list-sorting",
    icon: ListOrdered,
    color: "bg-emerald-500",
  },
  {
    title: "Arrangeable Gallery",
    description: "A responsive grid gallery where you can reorder images effortlessly.",
    href: "/gallery",
    icon: LayoutGrid,
    color: "bg-orange-500",
  },
  {
    title: "Transfer List",
    description: "Move items between two lists. Perfect for selecting items from a larger set.",
    href: "/transfer-list",
    icon: ArrowLeftRight,
    color: "bg-rose-500",
  },
  {
    title: "Tier List Maker",
    description: "Rank items into S, A, B, C, D tiers. Drag and drop to sort your favorites.",
    href: "/tier-list",
    icon: Layout,
    color: "bg-indigo-500",
  },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mb-16">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
          Drag & Drop <span className="text-blue-600">Experiences</span>
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400">
          A showcase of various interactive drag-and-drop patterns. Explore different use cases from simple sorting to 
          complex board layouts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demos.map((demo) => (
          <Link 
            key={demo.href} 
            href={demo.href}
            className="group relative flex flex-col p-8 rounded-3xl border bg-white dark:bg-zinc-900 transition-all hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
          >
            <div className={`w-12 h-12 rounded-2xl ${demo.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
              <demo.icon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-zinc-50">
              {demo.title}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 flex-grow">
              {demo.description}
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
              Try Demo <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}