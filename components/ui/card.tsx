import { cn } from "@/lib/utils"

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-3xl border border-border/70 bg-card p-4 shadow-sm", className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-base font-bold text-foreground", className)} {...props} />
}
