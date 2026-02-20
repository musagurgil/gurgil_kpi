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
      {/* Premium Gradient Header */}
      <div className="relative overflow-hidden bg-gradient-brand px-6 py-10 mb-8 sm:rounded-b-3xl sm:mx-4 lg:mx-6 sm:mt-0 shadow-lg">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]" />
        <div className="absolute -left-40 -top-40 w-80 h-80 bg-white/10 rounded-full blur-3xl opacity-50 animate-pulse-slow" />
        <div className="absolute -right-40 -bottom-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3 tracking-tight mb-2">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                <LucideIcons.Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="truncate drop-shadow-md">Çalışma Takvimi</span>
            </h1>
            <p className="text-base text-white/80 max-w-xl">
              Günlük aktivitelerinizi takip edin, toplantılarınızı planlayın ve görevlerinizi yönetin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            {/* Export Button */}
            <Button
              variant="outline"
              onClick={handleExportActivities}
              disabled={activities.length === 0}
              className="gap-2 w-full sm:w-auto justify-center bg-white/10 text-white hover:bg-white/20 hover:text-white border-white/20 backdrop-blur-sm shadow-sm transition-all duration-300"
            >
              <LucideIcons.Download className="w-4 h-4" />
              <span className="hidden sm:inline">Excel'e Aktar</span>
              <span className="sm:hidden">Aktar</span>
              <span className="hidden sm:inline">({activities.length})</span>
            </Button>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl w-full sm:w-auto justify-center border border-white/10 backdrop-blur-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('weekly')}
                className={`flex items-center gap-2 flex-1 sm:flex-none rounded-lg transition-all ${currentView === 'weekly' ? 'bg-white text-primary shadow-sm hover:bg-white hover:text-primary' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
              >
                <LucideIcons.CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Haftalık</span>
                <span className="sm:hidden font-medium">Hafta</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('monthly')}
                className={`flex items-center gap-2 flex-1 sm:flex-none rounded-lg transition-all ${currentView === 'monthly' ? 'bg-white text-primary shadow-sm hover:bg-white hover:text-primary' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
              >
                <LucideIcons.Calendar className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Aylık</span>
                <span className="sm:hidden font-medium">Ay</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-card/60 backdrop-blur-md border border-border/50 shadow-sm rounded-2xl p-4 relative z-20 -mt-14 mb-8">

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
            <Card className="overflow-hidden bg-card/60 backdrop-blur-md border-border/50 shadow-sm">
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