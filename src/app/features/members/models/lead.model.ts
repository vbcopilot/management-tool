// lead.model.ts

export type LeadStage =
  | 'New'
  | 'Contacted'
  | 'Trial'
  | 'Negotiate'
  | 'Onboard'
  | 'Closed - Lost';

export const LEAD_STAGES: LeadStage[] = [
  'New',
  'Contacted',
  'Trial',
  'Negotiate',
  'Onboard',
  'Closed - Lost',
];

export type LeadSource =
  | 'Walk-in'
  | 'Instagram'
  | 'Facebook'
  | 'WhatsApp'
  | 'Social Media'
  | 'Ads'
  | 'Inquiry Form';

export const LEAD_SOURCES: LeadSource[] = [
  'Walk-in',
  'Instagram',
  'Facebook',
  'WhatsApp',
  'Social Media',
  'Ads',
  'Inquiry Form',
];

// Strict pipeline — only these moves are allowed.
// 'Onboard' and 'Closed - Lost' are terminal: dropping a card there
// triggers a side-effect (member creation / deletion) instead of a normal move.
export const ALLOWED_TRANSITIONS: Record<LeadStage, LeadStage[]> = {
  New: ['Contacted', 'Closed - Lost'],
  Contacted: ['Trial', 'Closed - Lost'],
  Trial: ['Negotiate', 'Closed - Lost'],
  Negotiate: ['Onboard', 'Closed - Lost'],
  Onboard: [],
  'Closed - Lost': [],
};

export interface LeadNote {
  id: string;
  text: string;
  stage: LeadStage; // stage the note was written at
  createdAt: string; // ISO timestamp
}

export interface StageHistoryEntry {
  stage: LeadStage;
  enteredAt: string;
  exitedAt?: string;
}

export interface Lead {
  id?: number;
  name: string;
  phoneNumber: string;
  email?: string;
  goal?: string;
  leadSource: LeadSource;
  stage: LeadStage;
  notes: LeadNote[];
  stageHistory: StageHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

// Permanent record kept even after the lead card is removed from the board.
// Powers funnel / source analytics on the dashboard.
export interface LeadConversionRecord {
  id?: number;
  leadId?: number;
  name: string;
  phoneNumber: string;
  email?: string;
  goal?: string;
  leadSource: LeadSource;
  outcome: 'Onboarded' | 'Lost';
  failedAtStage?: LeadStage; // only set when outcome === 'Lost'
  failureReason?: string; // only set when outcome === 'Lost'
  createdAt: string; // when the lead was first created
  closedAt: string; // when it was onboarded / marked lost
  stageDurationsMs?: Record<string, number>;
}
