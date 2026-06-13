import Dexie, { Table } from 'dexie';
import { Member } from '../../features/members/models/member.model';
import { Trainer } from '../../features/members/models/trainer.model';

export class AppDb extends Dexie {
  members!: Table<Member, any>;
  trainers!: Table<Trainer, any>;

  constructor() {
    super('gym-db');

    this.version(1).stores({
      members: '++id, name, age, weight, height',
      trainers:
        '++id, name, specialization,phoneNumber,email,dateOfJoining,status,membersAssigned,averageRating,classesCompleted,Dues',
      memberAssignments:
        '++id, memberId,memberName, trainerId, isAssigned, memberGoal,memberRating,memberNotes,trainerNotes',
    });
  }
}

export const db = new AppDb();
