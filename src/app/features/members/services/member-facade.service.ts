import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, of } from 'rxjs';

import { Member } from '../models/member.model';

import { MemberRepository } from '../repositories/member.repository';

@Injectable({
  providedIn: 'root',
})
export class MemberFacadeService {
  private readonly membersSubject = new BehaviorSubject<Member[]>([]);

  readonly members$ = this.membersSubject.asObservable();

  constructor(private readonly memberRepository: MemberRepository) {}

  async loadMembers(): Promise<void> {
    const members = await this.memberRepository.findAll();
    this.membersSubject.next(members);
  }

  async saveMember(member: Member): Promise<void> {
    if (!member.id) {
      const id = await this.memberRepository.create(member);
      member.id = id;
    } else {
      await this.memberRepository.update(member);
    }

    await this.loadMembers();
  }

  async deleteMemberById(id: number): Promise<void> {
    await this.memberRepository.deleteById(id);
    await this.loadMembers();
  }
}
