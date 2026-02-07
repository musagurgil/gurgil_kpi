import React, { useState, useEffect } from 'react';
import { WeeklyCalendarGrid } from '@/components/calendar/WeeklyCalendarGrid';
import { EnhancedCalendarGrid } from '@/components/calendar/EnhancedCalendarGrid';
import { CalendarStats } from '@/components/calendar/CalendarStats';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { ActivityCharts } from '@/components/calendar/ActivityCharts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { useCalendar } from '@/hooks/useCalendar';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { exportActivitiesToCSV } from '@/lib/export';
import { toast } from 'sonner';

type ViewType = 'weekly' | 'monthly';

const Calendar = () => {
  const {
    selectedDate,
    setSelectedDate,
    activities,
    filters,
    updateFilters,
    clearFilters,
    loading,
    getActivitiesForDate,
    createActivity,
    updateActivity,
    deleteActivity,
    getMonthlyStats
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

  const handleExportActivities = () => {
    try {
      exportActivitiesToCSV(activities, 'calisma-takvimi');
      toast.success(`✅ ${activities.length} aktivite Excel dosyasına aktarıldı!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
      toast.error('❌ Export işlemi başarısız: ' + message);
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <LucideIcons.Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                Çalışma Takvimi
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Günlük aktivitelerinizi takip edin ve yönetin</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Export Button */}
              <Button
                variant="outline"
                onClick={handleExportActivities}
                disabled={activities.length === 0}
                className="gap-2 w-full sm:w-auto justify-center"
              >
                <LucideIcons.Download className="w-4 h-4" />
                <span className="hidden sm:inline">Excel'e Aktar</span>
                <span className="sm:hidden">Aktar</span>
                <span className="hidden sm:inline">({activities.length})</span>
              </Button>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg w-full sm:w-auto justify-center">
                <Button
                  variant={currentView === 'weekly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('weekly')}
                  className="flex items-center gap-2 flex-1 sm:flex-none"
                >
                  <LucideIcons.CalendarDays className="w-4 h-4" />
                  <span className="hidden sm:inline">Haftalık</span>
                  <span className="sm:hidden">Hafta</span>
                </Button>
                <Button
                  variant={currentView === 'monthly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('monthly')}
                  className="flex items-center gap-2 flex-1 sm:flex-none"
                >
                  <LucideIcons.Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Aylık</span>
                  <span className="sm:hidden">Ay</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation and Filters Row */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
                className="flex items-center gap-1 flex-1 sm:flex-none"
              >
                <LucideIcons.ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Önceki</span>
              </Button>

              <div className="text-sm sm:text-base font-semibold text-foreground min-w-[150px] sm:min-w-[200px] text-center px-2 sm:px-4">
                {formatDateRange()}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
                className="flex items-center gap-1 flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Sonraki</span>
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              {currentView === 'weekly' ? (
                <WeeklyCalendarGrid
                  selectedDate={selectedDate}
                  getActivitiesForDate={getActivitiesForDate}
                  onCreateActivity={createActivity}
                  onUpdateActivity={updateActivity}
                  onDeleteActivity={deleteActivity}
                />
              ) : (
                <EnhancedCalendarGrid
                  selectedDate={selectedDate}
                  getActivitiesForDate={getActivitiesForDate}
                  onCreateActivity={createActivity}
                  onUpdateActivity={updateActivity}
                  onDeleteActivity={deleteActivity}
                />
              )}
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <CalendarStats stats={getMonthlyStats(selectedDate)} />
          </div>
        </div>

        {/* Activity Charts */}
        {activities.length > 0 && (
          <ActivityCharts activities={activities} />
        )}
      </div>
    </div>
  );
};

export default Calendar;