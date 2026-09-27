export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  daysLeft: number;       // live countdown: end date - today
  validityDays: number;   // original plan span in days (end date - joined), fixed at enroll
  amount: number;
  dateOfJoining: string;
  createdAt: string;
  receiptSent: boolean;
}

// Dashboard filter tabs / stat cards.
export type MemberFilter = 'all' | 'expired' | 'active' | 'receipts';

// Membership durations offered in the enroll form (in months).
export const PLAN_MONTH_OPTIONS = [1, 3, 6, 9, 12] as const;
