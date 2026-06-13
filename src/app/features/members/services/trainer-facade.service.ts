import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Trainer, TrainerPayment } from '../models/trainer.model';
import { TrainerRepository } from '../repositories/trainer.repository';
import { AssignedMember } from '../../trainers/components/trainer-grid/member-assignment-page.component';

@Injectable({
  providedIn: 'root',
})
export class TrainerFacadeService {
  private readonly trainersSubject = new BehaviorSubject<Trainer[]>([]);
  readonly trainers$ = this.trainersSubject.asObservable();

  constructor(private readonly trainerRepository: TrainerRepository) {}

  async loadTrainers(): Promise<void> {
    const trainers = await this.trainerRepository.findAll();
    this.trainersSubject.next(trainers);
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

  async getTrainerById(id: number): Promise<Trainer | undefined> {
    return await this.trainerRepository.findById(id);
  }

  /**
   * Saves membersAssigned, recomputes averageRating and assignedMemberCount.
   * Unassigned members' ratings are still included in the average.
   */
  async updateTrainerAssignment(
    trainerId: number,
    payload: AssignedMember[]
  ): Promise<void> {
    const trainer = await this.trainerRepository.findById(trainerId);
    if (!trainer) return;

    trainer.membersAssigned = payload;

    const ratings = payload
      .filter((m) => m.ratingGiven !== null && m.ratingGiven !== undefined)
      .map((m) => m.ratingGiven as number);

    trainer.averageRating =
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10
          ) / 10
        : null;

    trainer.assignedMemberCount = payload.filter((m) => m.isAssigned).length;

    await this.trainerRepository.update(trainer);
    await this.loadTrainers();
  }

  /**
   * Saves full payment history and recomputes totalDuesPaid on the trainer.
   * totalDuesPaid = sum of netAmount for Paid + Partial entries.
   */
  async updateTrainerPayments(
    trainerId: number,
    payments: TrainerPayment[]
  ): Promise<void> {
    const trainer = await this.trainerRepository.findById(trainerId);
    if (!trainer) return;

    trainer.paymentHistory = payments;

    trainer.totalDuesPaid = payments
      .filter((p) => p.status === 'Paid' || p.status === 'Partial')
      .reduce((sum, p) => sum + (p.netAmount || 0), 0);

    await this.trainerRepository.update(trainer);
    await this.loadTrainers();
  }
}
