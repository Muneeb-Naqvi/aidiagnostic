import * as React from "react"
import { cn } from "@/lib/utils"

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "border-transparent bg-primary text-primary-foreground":
            variant === "default",
          "border border-border text-foreground":
            variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}
