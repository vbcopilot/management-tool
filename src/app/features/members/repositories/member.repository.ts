import { Injectable } from '@angular/core';
import { db } from '../../../core/db/app-db';
import { Member } from '../models/member.model';

@Injectable({
  providedIn: 'root',
})
export class MemberRepository {
  async findAll(): Promise<Member[]> {
    return await db.members.toArray();
  }

  async findById(id: number): Promise<Member | undefined> {
    return await db.members.get(id);
  }

  create(member: Omit<Member, 'id'>): Promise<number> {
    return db.members.add(member);
  }

  update(member: Member): Promise<number> {
    return db.members.put(member);
  }

  async deleteById(id: number): Promise<void> {
    await db.members.delete(id);
  }
}
