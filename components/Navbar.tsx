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
  { name: "Trello Board", href: "/trello-board", icon: Layout },
  { name: "List Sorting", href: "/list-sorting", icon: ListOrdered },
  { name: "Gallery", href: "/gallery", icon: LayoutGrid },
  { name: "Transfer List", href: "/transfer-list", icon: ArrowLeftRight },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-zinc-950/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">DnD Demo</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
          {/* Mobile menu could be added here if needed */}
        </div>
      </div>
    </nav>
  );
}
