import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { LeadCardComponent } from '../components/lead-card.component';
import { LeadDetailDrawerComponent } from '../components/lead-detail-drawer.component';
import { LostReasonModalComponent } from '../components/lost-reason-modal.component';
import { LEAD_STAGES, Lead, LeadStage } from '../../members/models/lead.model';
import { LeadFacadeService } from '../../members/services/lead-facade.service';
import { NewLeadModalComponent } from '../components/new-lead-modal.component';

@Component({
  selector: 'app-leads-board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    LeadCardComponent,
    NewLeadModalComponent,
    LeadDetailDrawerComponent,
    LostReasonModalComponent,
  ],
  templateUrl: './lead-board.page.html',
  styleUrls: ['./lead-board.page.css'],
})
export class LeadsBoardPage implements OnInit {
  readonly stages = LEAD_STAGES;

  leads: Lead[] = [];
  isLoading = true;

  showNewModal = false;
  selectedLead: Lead | null = null;
  pendingLostMove: { lead: Lead; toStage: LeadStage } | null = null;

  toastMessage = '';
  private toastTimer: any;

  constructor(
    private readonly leadFacade: LeadFacadeService,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.leadFacade.leads$.subscribe((leads) => {
      this.leads = leads;
      // Keep the open drawer's lead object in sync after notes/refreshes
      if (this.selectedLead) {
        const updated = leads.find((l) => l.id === this.selectedLead!.id);
        this.selectedLead = updated ?? null;
      }
    });
    await this.leadFacade.loadLeads();
    this.isLoading = false;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  leadsByStage(stage: LeadStage): Lead[] {
    return this.leads.filter((l) => l.stage === stage);
  }

  stageCount(stage: LeadStage): number {
    return this.leadsByStage(stage).length;
  }

  dropListId(stage: LeadStage): string {
    return 'col-' + stage;
  }

  connectedListsFor(stage: LeadStage): string[] {
    return this.stages
      .filter((s) => s !== stage)
      .map((s) => this.dropListId(s));
  }

  stageClass(stage: LeadStage): string {
    return stage.toLowerCase().replace(/[^a-z]+/g, '-');
  }

  trackByLeadId(_: number, lead: Lead): number {
    return lead.id!;
  }

  // ── Drag & drop ────────────────────────────────────────────────────────────

  enterPredicate = (drag: any, drop: CdkDropList): boolean => {
    const lead = drag.data as Lead;
    const toStage = drop.id.replace('col-', '') as LeadStage;
    return this.leadFacade.canTransition(lead.stage, toStage);
  };

  async drop(event: CdkDragDrop<Lead[]>, toStage: LeadStage): Promise<void> {
    const lead = event.item.data as Lead;
    if (!lead?.id || lead.stage === toStage) return;

    if (!this.leadFacade.canTransition(lead.stage, toStage)) {
      this.showToast(`Cannot move from "${lead.stage}" to "${toStage}"`);
      return;
    }

    if (toStage === 'Closed - Lost') {
      this.pendingLostMove = { lead, toStage };
      return;
    }

    if (toStage === 'Onboard') {
      await this.performOnboard(lead);
      return;
    }

    const res = await this.leadFacade.moveLead(lead.id, toStage);
    if (!res.ok) this.showToast(res.reason ?? 'Move failed');
  }

  // ── Detail drawer ──────────────────────────────────────────────────────────

  openCard(lead: Lead): void {
    this.selectedLead = lead;
  }

  closeDrawer(): void {
    this.selectedLead = null;
  }

  async onMoveRequested(payload: {
    lead: Lead;
    toStage: LeadStage;
  }): Promise<void> {
    const { lead, toStage } = payload;

    if (toStage === 'Closed - Lost') {
      this.pendingLostMove = { lead, toStage };
      this.selectedLead = null; // close drawer, lost-reason modal takes over
      return;
    }

    if (toStage === 'Onboard') {
      this.selectedLead = null;
      await this.performOnboard(lead);
      return;
    }

    const res = await this.leadFacade.moveLead(lead.id!, toStage);
    if (!res.ok) this.showToast(res.reason ?? 'Move failed');
  }

  // ── Terminal stage handlers ───────────────────────────────────────────────

  private async performOnboard(lead: Lead): Promise<void> {
    const res = await this.leadFacade.moveLead(lead.id!, 'Onboard');
    if (!res.ok) {
      this.showToast(res.reason ?? 'Could not onboard lead');
      return;
    }
    this.router.navigate(['/members']);
  }

  async confirmLost(reason: string): Promise<void> {
    if (!this.pendingLostMove) return;
    const { lead } = this.pendingLostMove;
    const res = await this.leadFacade.moveLead(
      lead.id!,
      'Closed - Lost',
      reason
    );
    if (!res.ok) this.showToast(res.reason ?? 'Could not mark as lost');
    this.pendingLostMove = null;
  }

  cancelLost(): void {
    this.pendingLostMove = null;
  }

  // ── Toast ──────────────────────────────────────────────────────────────────

  private showToast(msg: string): void {
    this.toastMessage = msg;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toastMessage = ''), 3000);
  }
}
