"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchModal from "@/components/search/search-modal";
import Image from "next/image";
import { Home, CalendarCheck2, Gamepad2 } from "lucide-react";
import { primaryNavLinks } from "@/lib/navigation";
interface HeaderProps {
  className?: string;
}

export function Navigation({ className }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Cmd/Ctrl+K 단축키로 열기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav className={cn("flex items-center gap-4 text-sm font-semibold", className)}>
        {primaryNavLinks.map((link) => {
          const isActive =
            pathname === link.path || (link.path !== "/" && pathname?.startsWith(link.path));
          return (
            <Link
              key={link.path}
              href={link.path}
              aria-current={isActive ? "page" : undefined}
              className={cn(isActive ? "opacity-100" : "transition opacity-70 hover:opacity-100")}>
              <div className="px-2 flex flex-col lg:flex-row min-w-18 lg:min-w-0 justify-center items-center gap-1">
                {link.path == "/" ? (
                  <Home className="h-4 w-4"></Home>
                ) : link.path == "/calendar" ? (
                  <CalendarCheck2 className="h-4 w-4"></CalendarCheck2>
                ) : (
                  <Gamepad2 className="h-4 w-4"></Gamepad2>
                )}
                {link.label}
              </div>
            </Link>
          );
        })}

        <div
          className={"cursor-pointer transition opacity-70 hover:opacity-100"}
          onClick={() => setOpen(true)}>
          <div className="px-2 flex flex-col lg:flex-row min-w-18 lg:min-w-0 justify-center items-center gap-2">
            <Search className="h-4 w-4" />
            <div className="">게임 검색</div>
          </div>
        </div>
      </nav>

      <SearchModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
