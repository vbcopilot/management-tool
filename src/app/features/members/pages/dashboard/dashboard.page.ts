import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      style="padding: 24px; font-family: sans-serif; color: #333; max-width: 600px;"
    >
      <!-- Header with Minimalistic Coming Soon Badge -->
      <div
        style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;"
      >
        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600;">
          Dashboard
        </h2>
        <span
          style="
          background-color: #f3f4f6; 
          color: #6b7280; 
          font-size: 0.75rem; 
          font-weight: 500; 
          padding: 4px 8px; 
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        "
        >
          Coming Soon
        </span>
      </div>

      <p
        style="color: #6b7280; font-size: 0.9rem; margin-bottom: 24px; line-height: 1.5;"
      >
        Your central overview for business performance, metrics, and active
        insights is currently under construction.
      </p>

      <!-- Minimal Dashboard Grid Placeholders -->
      <div
        style="
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); 
        gap: 16px;
      "
      >
        @for (metric of mockMetrics; track metric.label) {
        <div
          style="
            padding: 16px; 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            background: #fafafa;
          "
        >
          <span
            style="display: block; font-size: 0.8rem; color: #9ca3af; margin-bottom: 4px; font-weight: 500;"
          >
            {{ metric.label }}
          </span>
          <span
            style="display: block; font-size: 1.25rem; font-weight: 600; color: #d1d5db;"
          >
            {{ metric.placeholder }}
          </span>
        </div>
        }
      </div>
    </div>
  `,
})
export class DashboardPage {
  // Simple mock structure to build out the grid blocks beautifully
  mockMetrics = [
    { label: 'TOTAL MEMBERS', placeholder: '--' },
    { label: 'ACTIVE TRAINERS', placeholder: '--' },
    { label: 'MONTHLY REVENUE', placeholder: '$ --' },
  ];
}
