import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LEAD_SOURCES, LeadSource } from '../../members/models/lead.model';
import { LeadFacadeService } from '../../members/services/lead-facade.service';
@Component({
  selector: 'app-new-lead-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="nl-overlay" (click)="onOverlayClick($event)">
      <div class="nl-modal">
        <div class="nl-header">
          <span class="nl-title">New Lead</span>
          <button class="nl-close" (click)="close.emit()">×</button>
        </div>

        <div class="nl-body">
          <div class="nl-field">
            <label class="nl-label">Name *</label>
            <input
              class="nl-input"
              type="text"
              [(ngModel)]="form.name"
              placeholder="Full name"
            />
          </div>

          <div class="nl-row">
            <div class="nl-field">
              <label class="nl-label">Phone Number *</label>
              <input
                class="nl-input"
                type="tel"
                [(ngModel)]="form.phoneNumber"
                placeholder="10-digit number"
              />
            </div>
            <div class="nl-field">
              <label class="nl-label">Email</label>
              <input
                class="nl-input"
                type="email"
                [(ngModel)]="form.email"
                placeholder="optional"
              />
            </div>
          </div>

          <div class="nl-row">
            <div class="nl-field">
              <label class="nl-label">Goal</label>
              <input
                class="nl-input"
                type="text"
                [(ngModel)]="form.goal"
                placeholder="e.g. Weight loss"
              />
            </div>
            <div class="nl-field">
              <label class="nl-label">Lead Source *</label>
              <select class="nl-select" [(ngModel)]="form.leadSource">
                <option *ngFor="let s of sources" [value]="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <div class="nl-field">
            <label class="nl-label">Initial Note</label>
            <textarea
              class="nl-textarea"
              rows="3"
              [(ngModel)]="form.note"
              placeholder="Any context about this lead…"
            ></textarea>
          </div>

          <div class="nl-error" *ngIf="error">{{ error }}</div>
        </div>

        <div class="nl-footer">
          <button class="nl-btn nl-btn--ghost" (click)="close.emit()">
            Cancel
          </button>
          <button
            class="nl-btn nl-btn--primary"
            [disabled]="isSaving"
            (click)="submit()"
          >
            {{ isSaving ? 'Creating…' : 'Create Lead' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .nl-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          sans-serif;
      }
      .nl-modal {
        background: #fff;
        border-radius: 10px;
        width: 480px;
        max-width: 92vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
      }
      .nl-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 18px;
        border-bottom: 1px solid #eee;
      }
      .nl-title {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a1a;
      }
      .nl-close {
        border: none;
        background: none;
        font-size: 18px;
        color: #aaa;
        cursor: pointer;
        line-height: 1;
        padding: 0;
      }
      .nl-close:hover {
        color: #555;
      }
      .nl-body {
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .nl-row {
        display: flex;
        gap: 12px;
      }
      .nl-row .nl-field {
        flex: 1;
      }
      .nl-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .nl-label {
        font-size: 11px;
        font-weight: 500;
        color: #777;
      }
      .nl-input,
      .nl-select,
      .nl-textarea {
        font-size: 13px;
        padding: 7px 9px;
        border: 1px solid #ddd;
        border-radius: 6px;
        outline: none;
        font-family: inherit;
        color: #1a1a1a;
        background: #fff;
      }
      .nl-input:focus,
      .nl-select:focus,
      .nl-textarea:focus {
        border-color: #999;
      }
      .nl-textarea {
        resize: vertical;
      }
      .nl-error {
        font-size: 12px;
        color: #c0392b;
        background: #fdecea;
        padding: 7px 10px;
        border-radius: 6px;
      }
      .nl-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 12px 18px;
        border-top: 1px solid #eee;
      }
      .nl-btn {
        font-size: 12px;
        padding: 6px 16px;
        border-radius: 6px;
        cursor: pointer;
        border: 1px solid #ddd;
      }
      .nl-btn--ghost {
        background: #fff;
        color: #555;
      }
      .nl-btn--ghost:hover {
        background: #f5f5f5;
      }
      .nl-btn--primary {
        background: #1a1a1a;
        color: #fff;
        border-color: #1a1a1a;
      }
      .nl-btn--primary:hover:not(:disabled) {
        background: #333;
      }
      .nl-btn--primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class NewLeadModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  readonly sources = LEAD_SOURCES;

  form = {
    name: '',
    phoneNumber: '',
    email: '',
    goal: '',
    leadSource: 'Walk-in' as LeadSource,
    note: '',
  };

  isSaving = false;
  error = '';

  constructor(private readonly leadFacade: LeadFacadeService) {}

  onOverlayClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.close.emit();
  }

  async submit(): Promise<void> {
    this.error = '';

    if (!this.form.name.trim()) {
      this.error = 'Name is required';
      return;
    }
    if (!this.form.phoneNumber.trim()) {
      this.error = 'Phone number is required';
      return;
    }
    if (!this.form.leadSource) {
      this.error = 'Lead source is required';
      return;
    }

    this.isSaving = true;
    try {
      await this.leadFacade.createLead({
        name: this.form.name,
        phoneNumber: this.form.phoneNumber,
        email: this.form.email,
        goal: this.form.goal,
        leadSource: this.form.leadSource,
        note: this.form.note,
      });
      this.created.emit();
    } catch (err) {
      console.error(err);
      this.error = 'Failed to create lead. Please try again.';
    } finally {
      this.isSaving = false;
    }
  }
}
