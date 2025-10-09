"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export function TokenSection({
  title,
  tokens,
  onChange,
  placeholder,
  suggestions,
  rightAction,
}: {
  title: string;
  tokens: string[];
  onChange: (tokens: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  rightAction?: React.ReactNode;
}) {
  const [input, setInput] = useState("");

  const safeTokens = Array.isArray(tokens) ? tokens : [];
  const commit = (next: string[]) => onChange(Array.from(new Set(next)));

  const addToken = (token: string) => {
    const t = token.trim();
    if (!t) return;
    commit([...safeTokens, t]);
    setInput("");
  };
  const removeLast = () => {
    if (safeTokens.length === 0) return;
    commit(safeTokens.slice(0, -1));
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addToken(input);
    } else if (e.key === "Backspace" && input.length === 0) {
      removeLast();
    }
  };
  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    const parts = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) {
      e.preventDefault();
      commit([...safeTokens, ...parts]);
    }
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        {rightAction}
      </div>

      <div className="rounded-lg border border-border/60 p-2">
        <div className="flex flex-wrap gap-1.5">
          {safeTokens.map((t, i) => (
            <Badge key={`${t}-${i}`} variant="secondary" className="gap-1">
              {t}
              <button
                className="outline-none"
                onClick={() => onChange(safeTokens.filter((x, idx) => !(x === t && idx === i)))}
                aria-label={`${title} ${t} 제거`}>
                <X className="w-3 h-3 opacity-70" />
              </button>
            </Badge>
          ))}
          <input
            className="bg-transparent outline-none flex-1 min-w-[120px] text-sm px-1 py-1"
            value={input}
            placeholder={placeholder}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
          />
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              className="px-2 h-7 rounded-full text-xs border border-border/60 hover:bg-accent"
              onClick={() => onChange(Array.from(new Set([...safeTokens, s])))}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
