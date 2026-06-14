import Dexie, { Table } from 'dexie';
import { Member } from '../../features/members/models/member.model';
import { Trainer } from '../../features/members/models/trainer.model';
import { DashboardLayout } from '../../features/members/models/dashboard.model';

export class AppDb extends Dexie {
  members!: Table<Member, any>;
  trainers!: Table<Trainer, any>;
  dashboardLayouts!: Table<DashboardLayout, string>;

  constructor() {
    super('gym-db');

    this.version(1).stores({
      members: '++id, name, age, weight, height',
      trainers: '++id, name, specialization, status',
      dashboardLayouts: 'id',
    });

    // ✅ on() runs AFTER tables are ready, and only when the DB is first created
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
