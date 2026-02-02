"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Image as ImageIcon, 
  Layout, 
  ListOrdered, 
  LayoutGrid, 
  ArrowLeftRight,
  Home
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Image Upload", href: "/image-upload", icon: ImageIcon },
  { name: "Kanban Board", href: "/kanban-board", icon: Layout },
  { name: "List Sorting", href: "/list-sorting", icon: ListOrdered },
  { name: "Gallery", href: "/gallery", icon: LayoutGrid },
  { name: "Transfer List", href: "/transfer-list", icon: ArrowLeftRight },
  { name: "Tier List", href: "/tier-list", icon: Layout },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/50 dark:bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-foreground text-background rounded-lg flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              D
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground/90">DnD Demo</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1 bg-secondary/50 p-1 rounded-xl backdrop-blur-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === item.href
                    ? "bg-background text-foreground shadow-sm scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.name}</span>
              </Link>
            ))}
          </div>
          
          <div className="md:hidden">
            {/* Mobile menu trigger could go here */}
          </div>
        </div>
      </div>
    </nav>
  );
}