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
    gradient: "from-blue-500/20 to-blue-500/0",
  },
  {
    title: "Kanban Board",
    description: "Manage tasks across multiple columns. Drag cards between 'To Do', 'Doing', and 'Done'.",
    href: "/kanban-board",
    icon: Layout,
    color: "bg-purple-500",
    gradient: "from-purple-500/20 to-purple-500/0",
  },
  {
    title: "List Sorting",
    description: "Reorder a simple list of items with smooth animations and drag handles.",
    href: "/list-sorting",
    icon: ListOrdered,
    color: "bg-emerald-500",
    gradient: "from-emerald-500/20 to-emerald-500/0",
  },
  {
    title: "Arrangeable Gallery",
    description: "A responsive grid gallery where you can reorder images effortlessly.",
    href: "/gallery",
    icon: LayoutGrid,
    color: "bg-orange-500",
    gradient: "from-orange-500/20 to-orange-500/0",
  },
  {
    title: "Transfer List",
    description: "Move items between two lists. Perfect for selecting items from a larger set.",
    href: "/transfer-list",
    icon: ArrowLeftRight,
    color: "bg-rose-500",
    gradient: "from-rose-500/20 to-rose-500/0",
  },
  {
    title: "Tier List Maker",
    description: "Rank items into S, A, B, C, D tiers. Drag and drop to sort your favorites.",
    href: "/tier-list",
    icon: Layout,
    color: "bg-indigo-500",
    gradient: "from-indigo-500/20 to-indigo-500/0",
  },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mb-24 mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Next.js 15 + dnd-kit
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
          Interaction <span className="text-muted-foreground">Design</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A showcase of various interactive drag-and-drop patterns. Explore different use cases from simple sorting to 
          complex board layouts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demos.map((demo) => (
          <Link 
            key={demo.href} 
            href={demo.href}
            className="group relative flex flex-col p-8 rounded-3xl border bg-card text-card-foreground transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${demo.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className={`relative w-12 h-12 rounded-2xl ${demo.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-300`}>
              <demo.icon className="w-6 h-6" />
            </div>
            
            <h2 className="relative text-2xl font-bold mb-3 tracking-tight">
              {demo.title}
            </h2>
            
            <p className="relative text-muted-foreground mb-8 flex-grow leading-relaxed">
              {demo.description}
            </p>
            
            <div className="relative flex items-center gap-2 text-primary font-semibold group-hover:translate-x-1 transition-transform">
              Try Demo <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
