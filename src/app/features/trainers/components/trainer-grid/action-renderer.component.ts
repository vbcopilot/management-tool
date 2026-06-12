import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { TrainerFacadeService } from '../../../members/services/trainer-facade.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="action-buttons-container">
      <button
        [disabled]="!isEditing"
        (click)="save()"
        class="icon-btn save-btn"
        title="Save Changes"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather-icon"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>

      <button
        (click)="confirmDelete()"
        class="icon-btn delete-btn"
        title="Delete Member"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather-icon"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="17"></line>
        </svg>
      </button>
    </div>
  `,
  styles: [
    `
      .action-buttons-container {
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: center;
        height: 100%;
      }

      /* Clean, boundary-less circular button styling */
      .icon-btn {
        background: transparent;
        border: none;
        padding: 6px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
      }

      .feather-icon {
        width: 18px;
        height: 18px;
      }

      /* Save Icon Styling (Theme color: #054A91) */
      .save-btn {
        color: #054a91;
      }
      .save-btn:hover:not(:disabled) {
        background-color: rgba(5, 74, 145, 0.1);
        transform: scale(1.1);
      }
      .save-btn:disabled {
        color: #ccc;
        cursor: not-allowed;
      }

      /* Delete Icon Styling (Red theme) */
      .delete-btn {
        color: #dc3545;
      }
      .delete-btn:hover {
        background-color: rgba(220, 53, 69, 0.1);
        transform: scale(1.1);
      }
    `,
  ],
})
export class ActionRendererComponent {
  params: any;
  isEditing = false;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly facade = inject(TrainerFacadeService);

  agInit(params: any): void {
    this.params = params;
    this.checkEditState();

    this.params.api.addEventListener(
      'rowEditingStarted',
      this.onRowEditingChanged.bind(this)
    );
    this.params.api.addEventListener(
      'rowEditingStopped',
      this.onRowEditingChanged.bind(this)
    );
  }

  destroy(): void {
    if (this.params?.api) {
      this.params.api.removeEventListener(
        'rowEditingStarted',
        this.onRowEditingChanged.bind(this)
      );
      this.params.api.removeEventListener(
        'rowEditingStopped',
        this.onRowEditingChanged.bind(this)
      );
    }
  }

  private onRowEditingChanged(): void {
    this.checkEditState();
    this.cdr.detectChanges();
  }

  private checkEditState(): void {
    const editingCells = this.params.api.getEditingCells();
    this.isEditing = editingCells.some(
      (cell: any) => cell.rowIndex === this.params.node.rowIndex
    );
  }

  save(): void {
    this.params.api.stopEditing(false);
    this.facade.loadTrainers();
  }

  /**
   * Prompts the user with a confirmation modal before execution
   */
  confirmDelete(): void {
    const memberName = this.params.data?.name
      ? `"${this.params.data.name}"`
      : 'this member';
    const hasConfirmed = window.confirm(
      `Are you sure you want to permanently delete ${memberName}?`
    );

    if (hasConfirmed) {
      this.executeDelete();
    }
  }

  private executeDelete(): void {
    if (this.params.data?.id) {
      this.facade.deleteMemberById(this.params.data.id);
    } else {
      this.params.api.applyTransaction({ remove: [this.params.data] });
    }
  }
}
