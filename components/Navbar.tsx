"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Overview", href: "/" },
  { name: "Upload", href: "/image-upload" },
  { name: "Kanban", href: "/kanban-board" },
  { name: "Sorting", href: "/list-sorting" },
  { name: "Gallery", href: "/gallery" },
  { name: "Transfer", href: "/transfer-list" },
  { name: "Tier List", href: "/tier-list" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center text-xl font-serif italic border border-transparent group-hover:bg-transparent group-hover:text-primary group-hover:border-primary transition-all duration-300">
              D
            </div>
            <span className="text-xl font-serif font-bold tracking-tight text-foreground">
              The Collection
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-xs font-sans uppercase tracking-widest transition-colors py-2",
                  pathname === item.href
                    ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary"
                    : "text-muted-foreground hover:text-foreground hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-[1px] hover:after:bg-border"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
