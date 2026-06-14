import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LeadRepository } from '../repositories/lead.repository';
import { MemberFacadeService } from '../../members/services/member-facade.service';
import {
  ALLOWED_TRANSITIONS,
  Lead,
  LeadConversionRecord,
  LeadNote,
  LeadSource,
  LeadStage,
  StageHistoryEntry,
} from '../models/lead.model';

export interface MoveResult {
  ok: boolean;
  reason?: string;
  memberId?: number;
}

@Injectable({ providedIn: 'root' })
export class LeadFacadeService {
  private readonly leadsSubject = new BehaviorSubject<Lead[]>([]);
  readonly leads$ = this.leadsSubject.asObservable();

  constructor(
    private readonly repo: LeadRepository,
    private readonly memberFacade: MemberFacadeService
  ) {}

  async loadLeads(): Promise<void> {
    const leads = await this.repo.findAll();
    this.leadsSubject.next(leads);
  }

  canTransition(from: LeadStage, to: LeadStage): boolean {
    if (from === to) return true; // no-op move within same column
    return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  }

  nextStages(from: LeadStage): LeadStage[] {
    return ALLOWED_TRANSITIONS[from] ?? [];
  }

  // ── Create ───────────────────────────────────────────────────────────────

  async createLead(input: {
    name: string;
    phoneNumber: string;
    email?: string;
    goal?: string;
    leadSource: LeadSource;
    note?: string;
  }): Promise<void> {
    const now = new Date().toISOString();
    const notes: LeadNote[] = [];

    if (input.note?.trim()) {
      notes.push({
        id: crypto.randomUUID(),
        text: input.note.trim(),
        stage: 'New',
        createdAt: now,
      });
    }

    const lead: Omit<Lead, 'id'> = {
      name: input.name.trim(),
      phoneNumber: input.phoneNumber.trim(),
      email: input.email?.trim() || undefined,
      goal: input.goal?.trim() || undefined,
      leadSource: input.leadSource,
      stage: 'New',
      notes,
      stageHistory: [{ stage: 'New', enteredAt: now }],
      createdAt: now,
      updatedAt: now,
    };

    await this.repo.create(lead);
    await this.loadLeads();
  }

  // ── Notes ────────────────────────────────────────────────────────────────

  async addNote(leadId: number, text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) return;

    const lead = await this.repo.findById(leadId);
    if (!lead) return;

    const now = new Date().toISOString();
    lead.notes = [
      ...lead.notes,
      {
        id: crypto.randomUUID(),
        text: trimmed,
        stage: lead.stage,
        createdAt: now,
      },
    ];
    lead.updatedAt = now;

    await this.repo.update(lead);
    await this.loadLeads();
  }

  // ── Stage movement ───────────────────────────────────────────────────────

  /**
   * Moves a lead to `toStage`.
   *
   * - 'Onboard'        → creates a Member record from the lead's details,
   *                       logs the conversion, removes the lead from the board.
   * - 'Closed - Lost'  → REQUIRES `failureReason`. Logs the outcome
   *                       (including which stage it failed at) and removes
   *                       the lead from the board permanently.
   * - any other stage  → normal forward move within the pipeline.
   */
  async moveLead(
    leadId: number,
    toStage: LeadStage,
    failureReason?: string
  ): Promise<MoveResult> {
    const lead = await this.repo.findById(leadId);
    if (!lead) return { ok: false, reason: 'Lead not found' };

    if (lead.stage === toStage) return { ok: true };

    if (!this.canTransition(lead.stage, toStage)) {
      return {
        ok: false,
        reason: `Cannot move from "${lead.stage}" to "${toStage}"`,
      };
    }

    const now = new Date().toISOString();

    // Close current stage entry, open the new one
    const history: StageHistoryEntry[] = [...lead.stageHistory];
    if (history.length) {
      history[history.length - 1] = {
        ...history[history.length - 1],
        exitedAt: now,
      };
    }
    history.push({ stage: toStage, enteredAt: now });

    // ── Terminal: Closed - Lost ───────────────────────────────────────────
    if (toStage === 'Closed - Lost') {
      const reason = failureReason?.trim();
      if (!reason) return { ok: false, reason: 'A failure reason is required' };

      await this.logConversion(lead, history, {
        outcome: 'Lost',
        failedAtStage: lead.stage,
        failureReason: reason,
        closedAt: now,
      });
      await this.repo.deleteById(leadId);
      await this.loadLeads();
      return { ok: true };
    }

    // ── Terminal: Onboard → create Member ─────────────────────────────────
    if (toStage === 'Onboard') {
      const newMember: any = {
        name: lead.name,
        phoneNumber: lead.phoneNumber,
        email: lead.email,
        goal: lead.goal,
        leadSource: lead.leadSource,
        age: null,
        weight: null,
        height: null,
        status: 'Active',
      };
      await this.memberFacade.saveMember(newMember);

      await this.logConversion(lead, history, {
        outcome: 'Onboarded',
        closedAt: now,
      });
      await this.repo.deleteById(leadId);
      await this.loadLeads();
      return { ok: true, memberId: newMember.id };
    }

    // ── Normal forward move ────────────────────────────────────────────────
    lead.stage = toStage;
    lead.stageHistory = history;
    lead.updatedAt = now;
    await this.repo.update(lead);
    await this.loadLeads();
    return { ok: true };
  }

  // ── Conversion logging ──────────────────────────────────────────────────

  private async logConversion(
    lead: Lead,
    history: StageHistoryEntry[],
    extra: {
      outcome: 'Onboarded' | 'Lost';
      failedAtStage?: LeadStage;
      failureReason?: string;
      closedAt: string;
    }
  ): Promise<void> {
    const stageDurationsMs: Record<string, number> = {};
    history.forEach((h) => {
      if (!h.exitedAt) return;
      const dur =
        new Date(h.exitedAt).getTime() - new Date(h.enteredAt).getTime();
      stageDurationsMs[h.stage] = (stageDurationsMs[h.stage] || 0) + dur;
    });

    const record: Omit<LeadConversionRecord, 'id'> = {
      leadId: lead.id,
      name: lead.name,
      phoneNumber: lead.phoneNumber,
      email: lead.email,
      goal: lead.goal,
      leadSource: lead.leadSource,
      outcome: extra.outcome,
      failedAtStage: extra.failedAtStage,
      failureReason: extra.failureReason,
      createdAt: lead.createdAt,
      closedAt: extra.closedAt,
      stageDurationsMs,
    };

    await this.repo.createConversion(record);
  }

  async getConversionStats(): Promise<LeadConversionRecord[]> {
    return await this.repo.findAllConversions();
  }
}
