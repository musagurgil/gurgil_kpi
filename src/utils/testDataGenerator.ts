import { Activity } from '@/types/calendar';

// This file is deprecated - Activity data is now managed through Supabase
// Keeping for backward compatibility during migration

export const generateTestActivities = (): Activity[] => {
  console.log('Test activity generation is deprecated - use Supabase instead');
  return [];
};

export const initializeTestData = () => {
  console.log('Test data initialization is deprecated - use Supabase instead');
};
