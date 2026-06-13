import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: ` <a class="link-cell" (click)="navigate()">{{ value }}</a> `,
  styles: [
    `
      .link-cell {
        color: #1a6bbf;
        text-decoration: underline;
        cursor: pointer;
        font-size: 13px;
      }
      .link-cell:hover {
        color: #0f4a8a;
      }
    `,
  ],
})
export class LinkRendererComponent implements ICellRendererAngularComp {
  value: any;
  private trainerId!: number;
  private params!: ICellRendererParams;

  constructor(private router: Router) {}

  agInit(params: ICellRendererParams): void {
    this.params = params; // add: private params!: ICellRendererParams;
    this.value = params.value;
    this.trainerId = params.data?.id;
  }

  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    return true;
  }

  navigate(): void {
    if (!this.trainerId) return;
    const field = this.params?.colDef?.field;
    if (field === 'membersAssigned') {
      this.router.navigate(['/trainers', this.trainerId, 'assign']);
    } else if (field === 'dues') {
      this.router.navigate(['/trainers', this.trainerId, 'dues']);
    }
  }

  // Store params so navigate() can read the field:
}
