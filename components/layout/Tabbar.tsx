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
import { primaryNavLinks } from "@/lib/navigation";
import { Navigation } from "./navigation";
interface HeaderProps {
  className?: string;
}

export function TabBar({ className }: HeaderProps) {
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
    <div className="fixed lg:hidden bottom-0 w-full bg-card  py-4">
      <div></div>
      <Navigation className="flex justify-around"></Navigation>
    </div>
  );
}
