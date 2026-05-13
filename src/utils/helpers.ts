import type { Member } from '../types';

export const calculateDaysLeft = (joinedDate: string | null, planMonths: number): number => {
  if (!joinedDate) return 0;
  const expiryDate = new Date(joinedDate);
  expiryDate.setMonth(expiryDate.getMonth() + planMonths);
  const diffMs = expiryDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

export const isNewMember = (createdAt: string): boolean => {
  const diffDays = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 4;
};

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });


