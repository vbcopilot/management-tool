// trainer.model.ts

export interface TrainerPayment {
  id: string; // uuid generated on creation
  paymentDate: string; // ISO date string e.g. '2024-06-01'
  amount: number; // base salary for the month
  paymentMode: 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque' | 'Other';
  status: 'Paid' | 'Partial' | 'Pending' | 'Advance';
  sessionsCount: number | null;
  bonus: number;
  deduction: number;
  netAmount: number; // auto-computed: amount + bonus - deduction
  trainerNotes: any;
  adminNotes: string;
}

export interface Trainer {
  id?: any;
  name?: any;
  specialization?: any;
  phoneNumber?: any;
  email?: any;
  dateOfJoining?: any;
  status?: any;
  membersAssigned?: any;
  assignedMemberCount?: number;
  yearsOfExperience?: any;
  averageRating?: number | null;
  classesCompleted?: any;
  paymentHistory?: TrainerPayment[];
  totalDuesPaid?: any; // sum of netAmount where status is Paid or Partial
  Dues?: any;
}

export interface Member {
  id: any;
  name: any;
  ratingGiven: any;
  memberNotes: any;
  trainerNotes: any;
  isAssigned: any;
  goal: any;
}
