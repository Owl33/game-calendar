import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GameBadgeProps {
  name: string;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function GameBadge({
  name,
  className,
  variant = "secondary"
}: GameBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn(
        "text-xs font-medium truncate max-w-full",
        "bg-gradient-to-r from-primary/10 to-primary/5 text-primary",
        "border border-primary/20",
        className
      )}
      title={name}
    >
      {name}
    </Badge>
  );
}
