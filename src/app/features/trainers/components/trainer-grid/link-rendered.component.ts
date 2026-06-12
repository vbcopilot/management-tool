import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Router } from '@angular/router';

@Component({
  selector: 'app-link-renderer',
  standalone: true, // MUST be true for modern Angular
  template: ` <div style="display: flex; align-items: center; height: 100%;">
    <a
      href="javascript:void(0)"
      (click)="goToAssignment($event)"
      style="color: #1976d2; text-decoration: underline; cursor: pointer; pointer-events: auto;"
    >
      {{ 1000 }}
    </a>
  </div>`,
})
export class LinkRendererComponent implements ICellRendererAngularComp {
  public params!: ICellRendererParams;

  constructor(private router: Router) {}

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    return true;
  }

  goToAssignment(event: Event) {
    event.stopPropagation(); // Prevents AG Grid from intercepting
    const trainerId = this.params.data.id;
    this.router.navigate(['/trainers/assign-members', trainerId]);
  }
}
