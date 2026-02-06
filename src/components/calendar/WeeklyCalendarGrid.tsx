import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCalendar } from '@/hooks/useCalendar';
import { ActivityDialog } from './ActivityDialog';
import { EventDetailDialog } from './EventDetailDialog';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import * as LucideIcons from 'lucide-react';

interface WeeklyCalendarGridProps {
  selectedDate: Date;
}

export const WeeklyCalendarGrid = ({ selectedDate }: WeeklyCalendarGridProps) => {
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [activityDialog, setActivityDialog] = useState<{
    isOpen: boolean;
    date: Date;
    hour: number;
    editingActivity?: any;
  }>({
    isOpen: false,
    date: new Date(),
    hour: 9,
  });

  // Get start of week (Monday)
  const startOfWeekDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeekDate, i));
  
  // Hours from 8:00 to 18:00
  const hours = Array.from({ length: 11 }, (_, i) => i + 8);

  const getActivitiesForHour = (date: Date, hour: number) => {
    const dateActivities = getActivitiesForDate(date);
    return dateActivities.filter(activity => {
      try {
        let startTime, endTime;
        
        if (activity.startTime?.includes('T')) {
          // ISO string format
          const startDate = new Date(activity.startTime);
          const endDate = new Date(activity.endTime);
          startTime = startDate.getHours();
          endTime = endDate.getHours();
        } else if (activity.startTime?.includes(':')) {
          // Time string format (HH:MM)
          startTime = parseInt(activity.startTime.split(':')[0]);
          endTime = parseInt(activity.endTime?.split(':')[0] || activity.startTime.split(':')[0]);
        } else {
          return false;
        }
        
        // Only show activity in its starting hour
        return startTime === hour;
      } catch (error) {
        console.warn('Error parsing activity time:', activity.startTime, activity.endTime, error);
        return false;
      }
    });
  };

  const getActivityDuration = (activity: any) => {
    try {
      let startTime, endTime;
      
      if (activity.startTime?.includes('T')) {
        // ISO string format
        const startDate = new Date(activity.startTime);
        const endDate = new Date(activity.endTime);
        startTime = startDate.getHours() + (startDate.getMinutes() / 60);
        endTime = endDate.getHours() + (endDate.getMinutes() / 60);
      } else if (activity.startTime?.includes(':')) {
        // Time string format (HH:MM)
        const [startHour, startMin] = activity.startTime.split(':').map(Number);
        const [endHour, endMin] = activity.endTime?.split(':').map(Number) || [startHour, 0];
        startTime = startHour + (startMin / 60);
        endTime = endHour + (endMin / 60);
      } else {
        return 1; // Default 1 hour
      }
      
      return Math.max(1, endTime - startTime); // Minimum 1 hour
    } catch (error) {
      console.warn('Error calculating activity duration:', error);
      return 1;
    }
  };

  const getActivityHeight = (activity: any) => {
    const duration = getActivityDuration(activity);
    // Each hour is 60px, so duration * 60px
    return Math.max(60, duration * 60); // Minimum 60px height (1 hour)
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setActivityDialog({
      isOpen: true,
      date,
      hour,
    });
  };

  const handleActivityClick = (activity: any) => {
    setSelectedActivity(activity);
  };

  const handleEditActivity = (activity: any) => {
    setSelectedActivity(null);
    setActivityDialog({
      isOpen: true,
      date: new Date(activity.startTime || activity.date),
      hour: new Date(activity.startTime || activity.date).getHours(),
      editingActivity: activity,
    });
  };

  const { activities, deleteActivity, getActivitiesForDate } = useCalendar();

  const handleDeleteActivity = async (activity: any) => {
    try {
      await deleteActivity(activity.id);
      setSelectedActivity(null);
      // Force refresh of activities by calling loadActivities
      // This will be handled by the useCalendar hook automatically
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const getActivityStyle = (activity: any) => {
    // Get category color or default
    let categoryColor = '#3b82f6'; // Default blue
    
    // Check if activity has category with color
    if (activity.category?.color) {
      categoryColor = activity.category.color;
    } else if (activity.categoryId) {
      // Try to get color from categoryId if category object is not available
      // This is a fallback for when category data is not fully loaded
      const categoryMap: { [key: string]: string } = {
        'cmh04he93000rsjkf6q6sr4oq': '#10b981', // Proje - Green
        'cmh04hfem000ssjkf5qnf7mu8': '#f59e0b', // Eğitim - Orange  
        'cmh04hgki000vsjkf0l7tu4hh': '#8b5cf6', // Diğer - Purple
        'cmh04hdym000qsjkfgfutvrhv': '#3b82f6', // Toplantı - Blue
      };
      categoryColor = categoryMap[activity.categoryId] || '#3b82f6';
    }
    
    const duration = getActivityDuration(activity);
    const height = getActivityHeight(activity);
    
    return {
      backgroundColor: categoryColor,
      color: 'white',
      fontSize: '12px',
      fontWeight: '500',
      height: `${height}px`,
      minHeight: '60px',
      width: '100%',
      borderRadius: '6px',
      border: `1px solid ${categoryColor}20`,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      padding: '4px 8px',
      marginBottom: '2px',
      position: 'absolute' as const,
      top: '0',
      left: '0',
      right: '0',
      zIndex: 10,
      pointerEvents: 'auto' as const,
    };
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <LucideIcons.Clock className="w-5 h-5" />
          Haftalık Görünüm
        </h3>
        <p className="text-sm text-muted-foreground">
          Aktivitelerinizi haftalık olarak görüntüleyin ve yönetin
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-8 bg-muted/50">
          <div className="p-3 text-sm font-medium text-muted-foreground border-r border-border">
            Saat
          </div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-3 text-center border-r border-border last:border-r-0">
              <div className="text-sm font-medium text-foreground">
                {format(day, 'EEE', { locale: tr })}
              </div>
              <div className={`text-lg font-bold ${
                isToday(day) ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-border last:border-b-0">
              {/* Time Label */}
              <div className="p-3 text-sm text-muted-foreground border-r border-border bg-muted/30">
                {hour.toString().padStart(2, '0')}:00
              </div>
              
              {/* Day Columns */}
              {weekDays.map((day) => {
                const activities = getActivitiesForHour(day, hour);
                
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="min-h-[60px] p-1 border-r border-border last:border-r-0 relative group hover:bg-muted/20 transition-colors"
                    onClick={() => handleTimeSlotClick(day, hour)}
                    style={{ position: 'relative', pointerEvents: 'auto' }}
                  >
                    {/* Add Activity Button (visible on hover) */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTimeSlotClick(day, hour);
                      }}
                    >
                      <LucideIcons.Plus className="w-4 h-4" />
                    </Button>

                    {/* Activities */}
                    <div className="space-y-1">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          style={getActivityStyle(activity)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivityClick(activity);
                          }}
                        >
                          <div className="font-medium truncate">
                            {activity.title}
                          </div>
                          <div className="text-xs opacity-90">
                            {activity.startTime?.includes('T') 
                              ? new Date(activity.startTime).toTimeString().slice(0, 5)
                              : activity.startTime?.slice(0, 5) || ''
                            } - {activity.endTime?.includes('T')
                              ? new Date(activity.endTime).toTimeString().slice(0, 5)
                              : activity.endTime?.slice(0, 5) || ''
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <ActivityDialog
        date={activityDialog.date}
        isOpen={activityDialog.isOpen}
        onClose={() => setActivityDialog(prev => ({ ...prev, isOpen: false }))}
        initialHour={activityDialog.hour}
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