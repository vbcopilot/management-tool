import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Lead } from '../../members/models/lead.model';
@Component({
  selector: 'app-lost-reason-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="lr-overlay">
      <div class="lr-modal">
        <div class="lr-header">
          <span class="lr-icon">⚠</span>
          <span class="lr-title">Move to Closed - Lost</span>
        </div>

        <div class="lr-body">
          <p class="lr-text">
            <strong>{{ lead?.name }}</strong> will be removed from the board
            permanently. This action keeps a record for analytics — please
            specify why this lead didn't convert.
          </p>

          <label class="lr-label">Reason for failure *</label>
          <textarea
            class="lr-textarea"
            rows="3"
            [(ngModel)]="reason"
            placeholder="e.g. Too expensive, chose a competitor, not interested anymore…"
            autofocus
          ></textarea>
        </div>

        <div class="lr-footer">
          <button class="lr-btn lr-btn--ghost" (click)="cancel.emit()">
            Cancel
          </button>
          <button
            class="lr-btn lr-btn--danger"
            [disabled]="!reason.trim()"
            (click)="confirm.emit(reason.trim())"
          >
            Confirm — Mark as Lost
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .lr-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1100;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          sans-serif;
      }
      .lr-modal {
        background: #fff;
        border-radius: 10px;
        width: 440px;
        max-width: 92vw;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      }
      .lr-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 14px 18px;
        border-bottom: 1px solid #eee;
      }
      .lr-icon {
        font-size: 16px;
        color: #e57373;
      }
      .lr-title {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a1a;
      }
      .lr-body {
        padding: 14px 18px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .lr-text {
        font-size: 12px;
        color: #777;
        line-height: 1.5;
        margin: 0 0 4px;
      }
      .lr-label {
        font-size: 11px;
        font-weight: 500;
        color: #777;
      }
      .lr-textarea {
        font-size: 13px;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        outline: none;
        font-family: inherit;
        resize: vertical;
        color: #1a1a1a;
      }
      .lr-textarea:focus {
        border-color: #e57373;
      }
      .lr-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 12px 18px;
        border-top: 1px solid #eee;
      }
      .lr-btn {
        font-size: 12px;
        padding: 6px 16px;
        border-radius: 6px;
        cursor: pointer;
        border: 1px solid #ddd;
      }
      .lr-btn--ghost {
        background: #fff;
        color: #555;
      }
      .lr-btn--ghost:hover {
        background: #f5f5f5;
      }
      .lr-btn--danger {
        background: #c0392b;
        color: #fff;
        border-color: #c0392b;
      }
      .lr-btn--danger:hover:not(:disabled) {
        background: #a8332a;
      }
      .lr-btn--danger:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    `,
  ],
})
export class LostReasonModalComponent {
  @Input() lead: Lead | null = null;
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  reason = '';
}
