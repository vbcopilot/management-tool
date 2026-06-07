import Dexie, { Table } from 'dexie';
import { Member } from '../../features/members/models/member.model';

export class AppDb extends Dexie {
  members!: Table<Member, any>;

  constructor() {
    super('gym-db');

    this.version(1).stores({
      members: '++id, name, age, weight, height',
    });
  }
}

export const db = new AppDb();
