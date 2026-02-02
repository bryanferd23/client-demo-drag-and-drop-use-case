import Link from "next/link";
import { ArrowRight } from "lucide-react";

const demos = [
  {
    id: "01",
    title: "The Upload",
    description: "A refined dropzone interface for digital assets. Experience seamless file management with visual feedback.",
    href: "/image-upload",
    tag: "Utility",
  },
  {
    id: "02",
    title: "Kanban System",
    description: "Orchestrate workflows with a tactile board experience. Move tasks through lifecycle stages with precision.",
    href: "/kanban-board",
    tag: "Productivity",
  },
  {
    id: "03",
    title: "Sequence Sort",
    description: "Prioritize and arrange content with intuitive list reordering. Smooth transitions meet strict logic.",
    href: "/list-sorting",
    tag: "Organization",
  },
  {
    id: "04",
    title: "Visual Gallery",
    description: "Curate visual narratives in a responsive grid. A drag-and-drop experience designed for creatives.",
    href: "/gallery",
    tag: "Media",
  },
  {
    id: "05",
    title: "Dual Transfer",
    description: "Efficiently move items between datasets. The definitive pattern for selection and configuration.",
    href: "/transfer-list",
    tag: "Data",
  },
  {
    id: "06",
    title: "Tier Ranking",
    description: "Categorize and rank items into distinct tiers. A structured approach to qualitative assessment.",
    href: "/tier-list",
    tag: "Analysis",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-white">
      <header className="container mx-auto px-6 py-24 md:py-32 border-b border-border">
        <div className="max-w-4xl">
          <p className="text-sm font-sans uppercase tracking-widest text-muted-foreground mb-6">
            Interactive Experiments
          </p>
          <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tight leading-[0.9] mb-8 text-primary">
            Digital <br /> Tactility.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-serif italic max-w-2xl leading-relaxed">
            A curated collection of drag-and-drop patterns, reimagined for the modern web. 
            Exploring the intersection of utility and aesthetics.
          </p>
        </div>
      </header>

      <section className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {demos.map((demo) => (
            <Link 
              key={demo.href} 
              href={demo.href}
              className="group flex flex-col gap-6"
            >
              <div className="aspect-[4/3] bg-secondary border border-border p-8 flex items-center justify-center group-hover:bg-accent/10 transition-colors duration-500 relative overflow-hidden">
                <div className="absolute top-4 left-4 font-mono text-xs text-muted-foreground">
                  {demo.id}
                </div>
                <div className="absolute bottom-4 right-4 font-mono text-xs uppercase tracking-widest text-muted-foreground border border-border px-2 py-1">
                  {demo.tag}
                </div>
                <div className="w-16 h-16 bg-background border border-border flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                  <ArrowRight className="w-6 h-6 text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-serif font-bold group-hover:text-primary transition-colors">
                  {demo.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {demo.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}