import * as React from "react";

import { cn } from "@/lib/utils";

function Sheet({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground rounded-xl",
        "backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}

export { Sheet };
