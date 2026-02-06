import { Badge } from '@/components/ui/badge';

interface NotificationBadgeProps {
  count: number;
}

export const NotificationBadge = ({ count }: NotificationBadgeProps) => {
  if (count === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className="ml-auto min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold"
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
};
