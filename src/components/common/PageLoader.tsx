import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center min-h-[50vh] w-full", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
