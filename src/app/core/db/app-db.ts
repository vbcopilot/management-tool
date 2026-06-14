import Dexie, { Table } from 'dexie';
import { Member } from '../../features/members/models/member.model';
import { Trainer } from '../../features/members/models/trainer.model';
import { DashboardLayout } from '../../features/members/models/dashboard.model';
import {
  Lead,
  LeadConversionRecord,
} from '../../features/members/models/lead.model';

export class AppDb extends Dexie {
  members!: Table<Member, any>;
  trainers!: Table<Trainer, any>;
  dashboardLayouts!: Table<DashboardLayout, string>;
  leads!: Table<Lead, number>; // ← add
  leadConversions!: Table<LeadConversionRecord, number>; // ← add

  constructor() {
    super('gym-db');

    // Keep v1 exactly as it was
    this.version(1).stores({
      members: '++id, name, age, weight, height',
      trainers: '++id, name, specialization, status',
      dashboardLayouts: 'id',
    });

    // v2 — adds leads + leadConversions, extends members
    this.version(2).stores({
      members:
        '++id, name, age, weight, height, phoneNumber, email, leadSource',
      trainers: '++id, name, specialization, status',
      dashboardLayouts: 'id',
      leads: '++id, stage, leadSource, phoneNumber', // ← add
      leadConversions: '++id, outcome, leadSource, failedAtStage', // ← add
    });

    this.on('populate', () => {
      this.trainers.add({
        name: 'John Doe',
        specialization: 'Yoga',
        status: 'Active',
        membersAssigned: [
          {
            id: 101,
            name: 'Alice',
            ratingGiven: 5,
            memberNotes: '',
            trainerNotes: '',
          },
          {
            id: 102,
            name: 'Bob',
            ratingGiven: 4,
            memberNotes: '',
            trainerNotes: '',
          },
        ],
      });
    });
  }
}

export const db = new AppDb();
