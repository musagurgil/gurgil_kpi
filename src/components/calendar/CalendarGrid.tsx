import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { useCalendar } from '@/hooks/useCalendar';
import { useCategories } from '@/hooks/useCategories';
import { ActivityDialog } from './ActivityDialog';
import { cn } from '@/lib/utils';

export const CalendarGrid = () => {
  const { selectedDate, setSelectedDate, getActivitiesForDate } = useCalendar();
  const { getCategoryById } = useCategories();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showActivityDialog, setShowActivityDialog] = useState(false);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const days = [];
  const current = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
    setShowActivityDialog(true);
  };

  const getDayActivities = (date: Date) => {
    return getActivitiesForDate(date);
  };

  const getTotalHoursForDay = (date: Date) => {
    const activities = getDayActivities(date);
    return activities.reduce((total, activity) => total + activity.duration, 0) / 60;
  };

  return (
    <Card className="flex-1">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground">
            {monthNames[currentMonth]} {currentYear}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <LucideIcons.ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <LucideIcons.ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const activities = getDayActivities(day);
            const totalHours = getTotalHoursForDay(day);
            
            return (
              <div
                key={index}
                className={cn(
                  "min-h-[120px] p-2 border border-border rounded-lg cursor-pointer transition-smooth hover:bg-accent/50",
                  !isCurrentMonth(day) && "opacity-40",
                  isToday(day) && "ring-2 ring-primary"
                )}
                onClick={() => handleDayClick(day)}
              >
                <div className={cn(
                  "text-sm font-medium mb-2",
                  isToday(day) ? "text-primary font-bold" : "text-foreground"
                )}>
                  {day.getDate()}
                </div>
                
                {activities.length > 0 && (
                  <div className="space-y-1">
                    {activities.slice(0, 3).map(activity => {
                      const category = getCategoryById(activity.categoryId);
                      return (
                        <div
                          key={activity.id}
                          className="text-xs p-1 rounded text-white truncate"
                          style={{ backgroundColor: category?.color }}
                        >
                          {activity.title}
                        </div>
                      );
                    })}
                    {activities.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{activities.length - 3} daha
                      </div>
                    )}
                    <div className="text-xs font-medium text-primary">
                      {totalHours.toFixed(1)}h
                    </div>
                  </div>
                )}
                
                {activities.length === 0 && (
                  <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-smooth">
                    <LucideIcons.Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
      
      {showActivityDialog && selectedDay && (
        <ActivityDialog
          date={selectedDay}
          isOpen={showActivityDialog}
          onClose={() => setShowActivityDialog(false)}
        />
      )}
    </Card>
  );
};