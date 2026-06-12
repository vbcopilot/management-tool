import { Injectable } from '@angular/core';
import { db } from '../../../core/db/app-db';
import { Trainer } from '../models/trainer.model';

@Injectable({
  providedIn: 'root',
})
export class TrainerRepository {
  async findAll(): Promise<Trainer[]> {
    return await db.trainers.toArray();
  }

  async findById(id: number): Promise<Trainer | undefined> {
    return await db.trainers.get(id);
  }

  create(member: Omit<Trainer, 'id'>): Promise<number> {
    return db.trainers.add(member);
  }

  update(member: Trainer): Promise<number> {
    return db.trainers.put(member);
  }

  async deleteById(id: number): Promise<void> {
    await db.trainers.delete(id);
  }
}
