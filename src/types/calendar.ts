export interface ActivityCategory {
  id: string;
  name: string;
  color: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  categoryId: string;
  userId: string;
  duration: number; // in minutes
}

export interface CalendarStats {
  monthlyTotalHours: number;
  entryCount: number;
  averageDailyHours: number;
}

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  { id: 'meeting', name: 'Toplantı', color: 'hsl(217, 91%, 60%)' },
  { id: 'project', name: 'Proje', color: 'hsl(142, 71%, 45%)' },
  { id: 'training', name: 'Eğitim', color: 'hsl(38, 92%, 50%)' },
  { id: 'administrative', name: 'İdari', color: 'hsl(262, 83%, 58%)' },
  { id: 'break', name: 'Mola', color: 'hsl(0, 84%, 60%)' },
  { id: 'other', name: 'Diğer', color: 'hsl(215, 16%, 47%)' }
];