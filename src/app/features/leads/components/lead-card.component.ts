import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lead } from '../../members/models/lead.model';

@Component({
  selector: 'app-lead-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lc-card">
      <div class="lc-top">
        <span class="lc-name">{{ lead.name }}</span>
        <span class="lc-source" [class]="'lc-source--' + sourceClass">{{
          lead.leadSource
        }}</span>
      </div>

      <div class="lc-phone">{{ lead.phoneNumber }}</div>

      <div class="lc-goal" *ngIf="lead.goal">{{ lead.goal }}</div>

      <div class="lc-note" *ngIf="lastNote">
        <span class="lc-note-icon">📝</span>
        <span class="lc-note-text">{{ lastNote }}</span>
      </div>

      <div class="lc-footer">
        <span class="lc-notes-count" *ngIf="lead.notes.length">
          {{ lead.notes.length }} note{{ lead.notes.length > 1 ? 's' : '' }}
        </span>
        <span class="lc-days">{{ daysInStage }}d in stage</span>
      </div>
    </div>
  `,
  styles: [
    `
      .lc-card {
        background: #fff;
        border: 1px solid #e8e8e8;
        border-radius: 7px;
        padding: 10px 11px;
        cursor: pointer;
        transition: box-shadow 0.12s, border-color 0.12s;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .lc-card:hover {
        border-color: #ccc;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      }
      .lc-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 6px;
      }
      .lc-name {
        font-size: 13px;
        font-weight: 600;
        color: #1a1a1a;
        line-height: 1.3;
      }
      .lc-source {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        white-space: nowrap;
        flex-shrink: 0;
        font-weight: 500;
      }
      .lc-source--walk-in {
        background: #e8f0fb;
        color: #1a6bbf;
      }
      .lc-source--instagram {
        background: #fde8f3;
        color: #c2185b;
      }
      .lc-source--facebook {
        background: #e8f0fe;
        color: #1565c0;
      }
      .lc-source--whatsapp {
        background: #e6f7ed;
        color: #2e7d32;
      }
      .lc-source--social-media {
        background: #f3e8fb;
        color: #7b1fa2;
      }
      .lc-source--ads {
        background: #fff3e0;
        color: #e65100;
      }
      .lc-source--inquiry-form {
        background: #f0f0f0;
        color: #666;
      }

      .lc-phone {
        font-size: 11px;
        color: #888;
      }
      .lc-goal {
        font-size: 11px;
        color: #555;
        background: #f7f7f7;
        border-radius: 4px;
        padding: 3px 7px;
        display: inline-block;
        width: fit-content;
      }
      .lc-note {
        display: flex;
        align-items: flex-start;
        gap: 5px;
        font-size: 11px;
        color: #999;
        background: #fafafa;
        border-radius: 4px;
        padding: 5px 7px;
      }
      .lc-note-icon {
        flex-shrink: 0;
        font-size: 11px;
        line-height: 1.3;
      }
      .lc-note-text {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 1.3;
      }
      .lc-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 2px;
      }
      .lc-notes-count {
        font-size: 10px;
        color: #aaa;
      }
      .lc-days {
        font-size: 10px;
        color: #bbb;
        margin-left: auto;
      }
    `,
  ],
})
export class LeadCardComponent {
  @Input() lead!: Lead;

  get sourceClass(): string {
    return this.lead.leadSource.toLowerCase().replace(/\s+/g, '-');
  }

  get daysInStage(): number {
    const entry = this.lead.stageHistory[this.lead.stageHistory.length - 1];
    if (!entry) return 0;
    const ms = Date.now() - new Date(entry.enteredAt).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  }

  get lastNote(): string | null {
    if (!this.lead.notes.length) return null;
    return this.lead.notes[this.lead.notes.length - 1].text;
  }
}
