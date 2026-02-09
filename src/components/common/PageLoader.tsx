import { Loader2 } from "lucide-react";

export const PageLoader = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-dashboard-bg">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
};
