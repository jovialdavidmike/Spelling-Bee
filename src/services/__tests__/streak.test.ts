import { dataService } from '../dataService';

export function runStreakSanityChecks(): { passed: boolean; details: string[] } {
  const details: string[] = [];
  let passed = true;

  // 1. Initial streak data
  const initialStreak = dataService.getStudentStreakData();
  if (typeof initialStreak.currentStreak !== 'number' || initialStreak.currentStreak < 0) {
    details.push('Invalid currentStreak count');
    passed = false;
  }

  // 2. Weekdays format
  if (!Array.isArray(initialStreak.weekDays) || initialStreak.weekDays.length !== 7) {
    details.push('weekDays must contain 7 days');
    passed = false;
  }

  // 3. Milestones presence
  if (!initialStreak.allMilestones || initialStreak.allMilestones.length < 3) {
    details.push('Missing streak milestones');
    passed = false;
  }

  // 4. Test streak recording for today
  const today = new Date().toISOString().split('T')[0];
  const recordResult = dataService.recordPracticeDate(today);
  const updatedStreak = dataService.getStudentStreakData();

  if (!updatedStreak.isPracticedToday) {
    details.push('isPracticedToday should be true after recording practice for today');
    passed = false;
  }

  if (updatedStreak.currentStreak < 1) {
    details.push('currentStreak should be at least 1 after practice');
    passed = false;
  }

  return { passed, details };
}
