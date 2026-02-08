import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );
}
