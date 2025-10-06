import * as React from "react";

import { cn } from "@/lib/utils";

function Sheet({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground rounded-xl",
        "shadow-[0_6px_20px_oklch(0.03_0_0_/_0.6),0_3px_10px_oklch(0.03_0_0_/_0.5),0_1px_5px_oklch(0.03_0_0_/_0.4)]",
        "backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}

export { Sheet };
