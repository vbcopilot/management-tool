import { Injectable } from '@angular/core';
import { db } from '../../../core/db/app-db';
import { Lead, LeadConversionRecord } from '../models/lead.model';

@Injectable({ providedIn: 'root' })
export class LeadRepository {
  async findAll(): Promise<Lead[]> {
    return await db.leads.toArray();
  }

  async findById(id: number): Promise<Lead | undefined> {
    return await db.leads.get(id);
  }

  create(lead: Omit<Lead, 'id'>): Promise<number> {
    return db.leads.add(lead as Lead);
  }

  update(lead: Lead): Promise<number> {
    return db.leads.put(lead);
  }

  async deleteById(id: number): Promise<void> {
    await db.leads.delete(id);
  }

  // ── Conversion / outcome log ────────────────────────────────────────────────

  async findAllConversions(): Promise<LeadConversionRecord[]> {
    return await db.leadConversions.toArray();
  }

  createConversion(record: Omit<LeadConversionRecord, 'id'>): Promise<number> {
    return db.leadConversions.add(record as LeadConversionRecord);
  }
}
