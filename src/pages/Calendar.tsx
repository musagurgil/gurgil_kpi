import React, { useState, useEffect } from 'react';
import { WeeklyCalendarGrid } from '@/components/calendar/WeeklyCalendarGrid';
import { EnhancedCalendarGrid } from '@/components/calendar/EnhancedCalendarGrid';
import { CalendarStats } from '@/components/calendar/CalendarStats';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { useCalendar } from '@/hooks/useCalendar';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type ViewType = 'weekly' | 'monthly';

const Calendar = () => {
  const { 
    selectedDate, 
    setSelectedDate, 
    filters, 
    updateFilters, 
    clearFilters,
    loading 
  } = useCalendar();
  
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    return (localStorage.getItem('calendar-view') as ViewType) || 'weekly';
  });

  // Save view preference
  useEffect(() => {
    localStorage.setItem('calendar-view', currentView);
  }, [currentView]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (currentView === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatDateRange = () => {
    if (currentView === 'weekly') {
      const startOfWeek = new Date(selectedDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${format(startOfWeek, 'd MMM', { locale: tr })} - ${format(endOfWeek, 'd MMM yyyy', { locale: tr })}`;
    } else {
      return format(selectedDate, 'MMMM yyyy', { locale: tr });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-dashboard-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Takvim yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-dashboard-bg min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <LucideIcons.Calendar className="w-6 h-6" />
                Çalışma Takvimi
              </h1>
              <p className="text-sm text-muted-foreground">Günlük aktivitelerinizi takip edin ve yönetin</p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <Button
                variant={currentView === 'weekly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('weekly')}
                className="flex items-center gap-2"
              >
                <LucideIcons.CalendarDays className="w-4 h-4" />
                Haftalık
              </Button>
              <Button
                variant={currentView === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('monthly')}
                className="flex items-center gap-2"
              >
                <LucideIcons.Calendar className="w-4 h-4" />
                Aylık
              </Button>
            </div>
          </div>

          {/* Navigation and Filters Row */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
                className="flex items-center gap-1"
              >
                <LucideIcons.ChevronLeft className="w-4 h-4" />
                Önceki
              </Button>
              
              <div className="text-base font-semibold text-foreground min-w-[200px] text-center px-4">
                {formatDateRange()}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
                className="flex items-center gap-1"
              >
                Sonraki
                <LucideIcons.ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="ml-2 flex items-center gap-1"
              >
                <LucideIcons.CalendarDays className="w-4 h-4" />
                Bugün
              </Button>
            </div>

            <CalendarFilters 
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              {currentView === 'weekly' ? (
                <WeeklyCalendarGrid selectedDate={selectedDate} />
              ) : (
                <EnhancedCalendarGrid selectedDate={selectedDate} />
              )}
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <CalendarStats />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;