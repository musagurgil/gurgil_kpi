import { Button } from "@/components/ui/button";
import { Calendar, Grid3x3, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarViewType = 'weekly' | 'daily' | 'monthly' | 'grid';

interface CalendarViewSelectorProps {
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
}

export function CalendarViewSelector({ view, onViewChange }: CalendarViewSelectorProps) {
  const views: { value: CalendarViewType; label: string; icon: any }[] = [
    { value: 'weekly', label: 'Haftalık', icon: Calendar },
    { value: 'daily', label: 'Günlük', icon: Calendar },
    { value: 'monthly', label: 'Aylık', icon: Calendar },
    { value: 'grid', label: 'Tüm Odalar', icon: Grid3x3 },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {views.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant={view === value ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange(value)}
          className={cn(
            "flex items-center gap-2",
            view === value && "bg-primary text-primary-foreground"
          )}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}

