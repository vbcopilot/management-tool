import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, of } from 'rxjs';

import { Member } from '../models/member.model';

import { MemberRepository } from '../repositories/member.repository';
import { Trainer } from '../models/trainer.model';
import { TrainerRepository } from '../repositories/trainer.repository';

@Injectable({
  providedIn: 'root',
})
export class TrainerFacadeService {
  private readonly trainersSubject = new BehaviorSubject<Trainer[]>([]);

  readonly trainers$ = this.trainersSubject.asObservable();

  constructor(private readonly trainerRepository: TrainerRepository) {}

  async loadTrainers(): Promise<void> {
    const members = await this.trainerRepository.findAll();
    this.trainersSubject.next(members);
  }

  async saveTrainer(trainer: Trainer): Promise<void> {
    if (!trainer.id) {
      const id = await this.trainerRepository.create(trainer);
      trainer.id = id;
    } else {
      await this.trainerRepository.update(trainer);
    }

    await this.loadTrainers();
  }

  async deleteMemberById(id: number): Promise<void> {
    await this.trainerRepository.deleteById(id);
    await this.loadTrainers();
  }
}
