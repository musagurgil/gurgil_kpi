import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card'; // unused
// import { Badge } from '@/components/ui/badge'; // unused
// import { useCalendar } from '@/hooks/useCalendar'; // unused
import { ActivityDialog } from './ActivityDialog';
import { EventDetailDialog } from './EventDetailDialog';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import * as LucideIcons from 'lucide-react';
import { Activity } from '@/types/calendar';

interface EnhancedCalendarGridProps {
  selectedDate: Date;
  getActivitiesForDate: (date: Date) => Activity[];
  onDeleteActivity: (id: string) => Promise<void>;
  onUpdateActivity: (id: string, data: Partial<Activity>) => Promise<void | Activity>;
  onCreateActivity: (data: Omit<Activity, 'id' | 'userId'>) => Promise<void | Activity>;
}

export const EnhancedCalendarGrid = ({
  selectedDate,
  getActivitiesForDate,
  onDeleteActivity,
  onUpdateActivity,
  onCreateActivity // unused directly but kept for interface compliance or future use
}: EnhancedCalendarGridProps) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityDialog, setActivityDialog] = useState<{
    isOpen: boolean;
    date: Date;
    editingActivity?: Activity;
  }>({
    isOpen: false,
    date: new Date(),
  });

  // Get month boundaries
  // const monthStart = startOfMonth(selectedDate); // unused
  // const monthEnd = endOfMonth(selectedDate); // unused

  // Get all days in the month view (including previous/next month days)
  const startDate = startOfMonth(selectedDate);
  startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Start from Monday

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 41); // 6 weeks * 7 days - 1

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getActivitiesForDateLocal = (date: Date) => {
    return getActivitiesForDate(date);
  };

  const handleDateClick = (date: Date) => {
    setActivityDialog({
      isOpen: true,
      date,
    });
  };

  const handleActivityClick = (activity: Activity, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedActivity(activity);
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(null);
    setActivityDialog({
      isOpen: true,
      date: new Date(activity.startTime || activity.date),
      editingActivity: activity,
    });
  };

  const handleDeleteActivity = async (activity: Activity) => {
    try {
      if (activity.id) {
        await onDeleteActivity(activity.id);
        setSelectedActivity(null);
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const getActivityStyle = (activity: Activity) => {
    const categoryColor = activity.category?.color || '#3b82f6';
    return {
      backgroundColor: categoryColor,
      color: 'white',
    };
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <LucideIcons.Calendar className="w-5 h-5" />
          Aylık Görünüm
        </h3>
        <p className="text-sm text-muted-foreground">
          {format(selectedDate, 'MMMM yyyy', { locale: tr })}
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-black/5 border-b border-border/50">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
            <div key={day} className="p-3 text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground border-r border-border/50 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 bg-card/30">
          {days.map((day) => {
            const dayActivities = getActivitiesForDateLocal(day);
            const isCurrentMonth = isSameMonth(day, selectedDate);
            const isTodayDate = isToday(day);
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={day.toISOString()}
                className={`
                  min-h-[120px] p-2 border-r border-b border-border/50 last:border-r-0 cursor-pointer
                  hover:bg-black/5 transition-colors relative group
                  ${!isCurrentMonth ? 'bg-black/5 text-muted-foreground/50' : ''}
                  ${isTodayDate ? 'bg-primary/5' : ''}
                  ${isSelected ? 'ring-2 ring-primary ring-inset z-10' : ''}
                `}
                onClick={() => handleDateClick(day)}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isTodayDate ? 'text-primary font-bold' : ''
                    }`}>
                    {format(day, 'd')}
                  </span>

                  {/* Add Button (visible on hover) */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateClick(day);
                    }}
                  >
                    <LucideIcons.Plus className="w-3 h-3" />
                  </Button>
                </div>

                {/* Activities */}
                <div className="space-y-1">
                  {dayActivities.slice(0, 3).map((activity) => (
                    <div
                      key={activity.id}
                      className="px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity truncate"
                      style={getActivityStyle(activity)}
                      onClick={(e) => handleActivityClick(activity, e)}
                    >
                      {activity.title}
                    </div>
                  ))}

                  {/* More Activities Indicator */}
                  {dayActivities.length > 3 && (
                    <div className="text-xs text-muted-foreground px-2 py-1">
                      +{dayActivities.length - 3} daha
                    </div>
                  )}
                </div>

                {/* Hours Summary */}
                {dayActivities.length > 0 && (
                  <div className="absolute bottom-1 right-1 text-xs text-muted-foreground">
                    {(() => {
                      const totalHours = dayActivities.reduce((sum, activity) => {
                        try {
                          const startTime = activity.startTime?.includes('T')
                            ? new Date(activity.startTime)
                            : new Date(`2000-01-01T${activity.startTime || '00:00'}`);

                          const endTime = activity.endTime?.includes('T')
                            ? new Date(activity.endTime)
                            : new Date(`2000-01-01T${activity.endTime || '00:00'}`);

                          const durationMs = endTime.getTime() - startTime.getTime();
                          return sum + (durationMs / (1000 * 60 * 60));
                        } catch (error) {
                          return sum;
                        }
                      }, 0);

                      return `${totalHours.toFixed(1)}h`;
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dialogs */}
      <ActivityDialog
        date={activityDialog.date}
        isOpen={activityDialog.isOpen}
        onClose={() => setActivityDialog(prev => ({ ...prev, isOpen: false }))}
        editingActivity={activityDialog.editingActivity}
      />

      <EventDetailDialog
        activity={selectedActivity}
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        onEdit={handleEditActivity}
        onDelete={handleDeleteActivity}
      />
    </div>
  );
};