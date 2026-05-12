export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  daysLeft: number;
  amount: number;
  dateOfJoining: string;
  createdAt: string;
  planMonths: number;
}

export enum Screen {
  MEMBERS = 'members',
  RECEIPTS = 'receipts',
  ANNOUNCEMENTS = 'announcements',
}
