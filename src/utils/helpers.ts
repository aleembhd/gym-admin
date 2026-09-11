import type { Member } from '../types';

// Counts whole calendar days between two dates (midnight to midnight),
// so the number only changes when the date rolls over at 12:00 AM.
const wholeDaysBetween = (from: Date, to: Date): number => {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

// Live days-left from the joining date plus a number of *calendar* months.
// Expiry = joined + planMonths calendar months. Days left = expiry - today,
// measured midnight-to-midnight so it decreases by exactly 1 each midnight.
export const calculateDaysLeft = (joinedDate: string | null, planMonths: number): number => {
  if (!joinedDate || !planMonths) return 0;
  const expiryDate = new Date(joinedDate);
  expiryDate.setMonth(expiryDate.getMonth() + planMonths);
  return Math.max(0, wholeDaysBetween(new Date(), expiryDate));
};

export const isNewMember = (createdAt: string): boolean => {
  const diffDays = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 4;
};

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });


