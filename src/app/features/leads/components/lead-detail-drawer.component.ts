import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Lead, LeadStage } from '../../members/models/lead.model';
import { LeadFacadeService } from '../../members/services/lead-facade.service';

@Component({
  selector: 'app-lead-detail-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ld-overlay" (click)="onOverlayClick($event)">
      <div class="ld-drawer">
        <div class="ld-header">
          <div>
            <div class="ld-name">{{ lead.name }}</div>
            <span class="ld-stage-badge">{{ lead.stage }}</span>
          </div>
          <button class="ld-close" (click)="close.emit()">×</button>
        </div>

        <div class="ld-body">
          <!-- Contact info -->
          <div class="ld-section">
            <div class="ld-info-row">
              <span class="ld-info-label">Phone</span
              ><span class="ld-info-val">{{ lead.phoneNumber }}</span>
            </div>
            <div class="ld-info-row" *ngIf="lead.email">
              <span class="ld-info-label">Email</span
              ><span class="ld-info-val">{{ lead.email }}</span>
            </div>
            <div class="ld-info-row" *ngIf="lead.goal">
              <span class="ld-info-label">Goal</span
              ><span class="ld-info-val">{{ lead.goal }}</span>
            </div>
            <div class="ld-info-row">
              <span class="ld-info-label">Source</span
              ><span class="ld-info-val">{{ lead.leadSource }}</span>
            </div>
            <div class="ld-info-row">
              <span class="ld-info-label">Created</span
              ><span class="ld-info-val">{{
                lead.createdAt | date : 'MMM d, y, h:mm a'
              }}</span>
            </div>
          </div>

          <!-- Notes timeline -->
          <div class="ld-section">
            <div class="ld-section-title">Notes ({{ lead.notes.length }})</div>

            <div class="ld-notes" *ngIf="lead.notes.length; else noNotes">
              <div class="ld-note" *ngFor="let note of reversedNotes()">
                <div class="ld-note-meta">
                  <span class="ld-note-stage">{{ note.stage }}</span>
                  <span class="ld-note-date">{{
                    note.createdAt | date : 'MMM d, h:mm a'
                  }}</span>
                </div>
                <div class="ld-note-text">{{ note.text }}</div>
              </div>
            </div>
            <ng-template #noNotes>
              <div class="ld-empty">No notes yet</div>
            </ng-template>

            <div class="ld-add-note">
              <textarea
                class="ld-note-input"
                rows="2"
                [(ngModel)]="newNote"
                placeholder="Add a note at current stage ({{ lead.stage }})…"
              ></textarea>
              <button
                class="ld-btn ld-btn--ghost"
                [disabled]="!newNote.trim() || isSavingNote"
                (click)="addNote()"
              >
                {{ isSavingNote ? 'Adding…' : '+ Add Note' }}
              </button>
            </div>
          </div>

          <!-- Stage actions -->
          <div class="ld-section" *ngIf="nextStages.length">
            <div class="ld-section-title">Move Lead</div>
            <div class="ld-actions">
              <button
                *ngFor="let stage of nextStages"
                class="ld-btn"
                [class.ld-btn--success]="stage === 'Onboard'"
                [class.ld-btn--danger]="stage === 'Closed - Lost'"
                [class.ld-btn--primary]="
                  stage !== 'Onboard' && stage !== 'Closed - Lost'
                "
                (click)="requestMove(stage)"
              >
                {{
                  stage === 'Onboard'
                    ? '✓ Onboard as Member'
                    : stage === 'Closed - Lost'
                    ? '✕ Mark as Lost'
                    : '→ Move to ' + stage
                }}
              </button>
            </div>
          </div>

          <div class="ld-section" *ngIf="!nextStages.length">
            <div class="ld-empty">This lead is in a terminal stage.</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .ld-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: flex-end;
        z-index: 900;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          sans-serif;
      }
      .ld-drawer {
        background: #fff;
        width: 380px;
        max-width: 92vw;
        height: 100%;
        overflow-y: auto;
        box-shadow: -8px 0 24px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
      }
      .ld-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 16px 18px;
        border-bottom: 1px solid #eee;
        flex-shrink: 0;
      }
      .ld-name {
        font-size: 15px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 4px;
      }
      .ld-stage-badge {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 5px;
        background: #f0f0f0;
        color: #666;
        font-weight: 500;
      }
      .ld-close {
        border: none;
        background: none;
        font-size: 18px;
        color: #aaa;
        cursor: pointer;
        line-height: 1;
      }
      .ld-close:hover {
        color: #555;
      }

      .ld-body {
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .ld-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ld-section-title {
        font-size: 11px;
        font-weight: 600;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .ld-info-row {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        padding: 3px 0;
      }
      .ld-info-label {
        color: #999;
      }
      .ld-info-val {
        color: #1a1a1a;
        font-weight: 500;
        text-align: right;
      }

      .ld-notes {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 220px;
        overflow-y: auto;
      }
      .ld-note {
        background: #fafafa;
        border-radius: 6px;
        padding: 8px 10px;
      }
      .ld-note-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      .ld-note-stage {
        font-size: 10px;
        padding: 1px 6px;
        border-radius: 4px;
        background: #eaf3de;
        color: #3b6d11;
        font-weight: 500;
      }
      .ld-note-date {
        font-size: 10px;
        color: #bbb;
      }
      .ld-note-text {
        font-size: 12px;
        color: #444;
        line-height: 1.4;
        white-space: pre-wrap;
      }

      .ld-empty {
        font-size: 12px;
        color: #bbb;
        padding: 8px 0;
      }

      .ld-add-note {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 4px;
      }
      .ld-note-input {
        font-size: 12px;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        resize: vertical;
        font-family: inherit;
        outline: none;
        color: #1a1a1a;
      }
      .ld-note-input:focus {
        border-color: #999;
      }

      .ld-actions {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .ld-btn {
        font-size: 12px;
        padding: 7px 12px;
        border-radius: 6px;
        cursor: pointer;
        border: 1px solid #ddd;
        background: #fff;
        color: #444;
        text-align: left;
      }
      .ld-btn:hover:not(:disabled) {
        background: #f5f5f5;
      }
      .ld-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .ld-btn--ghost {
        align-self: flex-end;
      }
      .ld-btn--primary {
        border-color: #c7d7f5;
        background: #eef3fd;
        color: #1a4fa0;
        font-weight: 500;
      }
      .ld-btn--primary:hover {
        background: #dfeaff;
      }
      .ld-btn--success {
        border-color: #b8d98b;
        background: #eaf3de;
        color: #2e7d32;
        font-weight: 500;
      }
      .ld-btn--success:hover {
        background: #d9ecbf;
      }
      .ld-btn--danger {
        border-color: #f3c5c0;
        background: #fdecea;
        color: #c0392b;
        font-weight: 500;
      }
      .ld-btn--danger:hover {
        background: #fadbd6;
      }
    `,
  ],
})
export class LeadDetailDrawerComponent implements OnChanges {
  @Input() lead!: Lead;
  @Output() close = new EventEmitter<void>();
  @Output() moveRequested = new EventEmitter<{
    lead: Lead;
    toStage: LeadStage;
  }>();

  newNote = '';
  isSavingNote = false;
  nextStages: LeadStage[] = [];

  constructor(private readonly leadFacade: LeadFacadeService) {}

  ngOnChanges(): void {
    this.nextStages = this.leadFacade.nextStages(this.lead.stage);
  }

  onOverlayClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.close.emit();
  }

  reversedNotes() {
    return [...this.lead.notes].reverse();
  }

  async addNote(): Promise<void> {
    if (!this.newNote.trim() || !this.lead.id) return;
    this.isSavingNote = true;
    try {
      await this.leadFacade.addNote(this.lead.id, this.newNote);
      this.newNote = '';
    } finally {
      this.isSavingNote = false;
    }
  }

  requestMove(stage: LeadStage): void {
    this.moveRequested.emit({ lead: this.lead, toStage: stage });
  }
}
