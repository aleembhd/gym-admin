import type { Member } from '../types';

// Counts whole calendar days between two dates (midnight to midnight),
// so the number only changes when the date rolls over at 12:00 AM.
const wholeDaysBetween = (from: Date, to: Date): number => {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

// Convert a plan length in calendar months to a fixed number of days,
// counted from a start date. Used at enroll time so `validity` stores the
// original span in days (end date - joined). e.g. 1 month from Jan 15 -> Feb 15.
export const planMonthsToDays = (startDate: string, planMonths: number): number => {
  if (!startDate || !planMonths) return 0;
  const start = new Date(startDate);
  const end = new Date(startDate);
  end.setMonth(end.getMonth() + planMonths);
  return Math.max(0, wholeDaysBetween(start, end));
};

// The plan end date = joined + validity days (validity is the original span).
// Returns null when we can't determine it.
export const getExpiryDate = (joinedDate: string | null, validityDays: number): Date | null => {
  if (!joinedDate || !validityDays) return null;
  const expiry = new Date(joinedDate);
  expiry.setDate(expiry.getDate() + validityDays);
  return expiry;
};

// Live days-left = end date - today, midnight-to-midnight, so it drops by 1
// at each midnight and reaches 0 when the plan ends. end date = joined + validity.
export const calculateDaysLeft = (joinedDate: string | null, validityDays: number): number => {
  const expiry = getExpiryDate(joinedDate, validityDays);
  if (!expiry) return 0;
  return Math.max(0, wholeDaysBetween(new Date(), expiry));
};

export const isNewMember = (createdAt: string): boolean => {
  const diffDays = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 4;
};

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// Approximate the plan length in months from the total validity (days).
// Used only for the "Membership" label since the DB has no months column.
export const monthsFromValidity = (validityDays: number): number => {
  if (!validityDays) return 0;
  return Math.max(1, Math.round(validityDays / 30));
};

// Human-readable membership length from total validity days, e.g. "6 months".
export const membershipLabel = (validityDays: number): string => {
  if (!validityDays) return 'No plan';
  const months = monthsFromValidity(validityDays);
  return `${months} month${months > 1 ? 's' : ''}`;
};

// Format a rupee amount like "₹7,200".
export const formatRupees = (amount: number): string =>
  `₹${(amount || 0).toLocaleString('en-IN')}`;

export type MemberStatus = 'active' | 'expired' | 'none';

// A member has a plan when they have a join date and a validity span.
// Active while days left > 0, expired once it hits 0, 'none' if no plan yet.
export const getMemberStatus = (member: {
  dateOfJoining: string;
  validityDays: number;
  daysLeft: number;
}): MemberStatus => {
  const hasPlan = Boolean(member.dateOfJoining && member.validityDays);
  if (!hasPlan) return 'none';
  return member.daysLeft > 0 ? 'active' : 'expired';
};

// Two-letter initials from a name, e.g. "Meera Iyer" -> "MI".
export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
