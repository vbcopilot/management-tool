import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GridsterConfig,
  GridsterItem,
  GridsterModule,
} from 'angular-gridster2';

interface DashboardItem extends GridsterItem {
  id: string;
  title: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, GridsterModule],
  // 1. Give the main container a fixed or percentage height
  template: `
    <div
      style="padding: 20px; background: #f0f2f5; height: 100vh; overflow-y: auto;"
    >
      <div style="margin-bottom: 20px;">
        <button
          (click)="toggleEdit()"
          style="padding: 10px 20px; cursor: pointer;"
        >
          {{
            options.draggable?.enabled
              ? 'Lock Dashboard'
              : 'Customize Dashboard'
          }}
        </button>
      </div>

      <gridster [options]="options" style="background: transparent;">
        <gridster-item
          *ngFor="let item of dashboard"
          [item]="item"
          style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 15px; border: 1px solid #ddd;"
        >
          <div style="font-weight: bold; color: #666; margin-bottom: 10px;">
            {{ item.title }}
          </div>
          <div style="font-size: 2rem; font-weight: bold; color: #333;">
            {{ getMockData(item.id) }}
          </div>
        </gridster-item>
      </gridster>
    </div>
  `,
})
export class DashboardPage {
  options: GridsterConfig = {
    gridType: 'fit',
    displayGrid: 'none', // Initial state
    pushItems: true,
    draggable: {
      enabled: true, // Keep enabled, just toggle it in your button
    },
    resizable: {
      enabled: true,
    },
    margin: 15,
    outerMargin: true,
    fixedColWidth: 200,
    fixedRowHeight: 150,
    minCols: 6,
    minRows: 6,
  };

  changedOptions() {
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
  }

  dashboard: DashboardItem[] = Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
    cols: i < 2 ? 2 : 1, // First two are wider
    rows: i < 2 ? 1 : 1,
    y: 0,
    x: (i * 2) % 6,
    title: [
      'Active Members',
      'Revenue',
      'Overweight',
      'Normal',
      'Underweight',
      'Attendance',
      'Expired',
      'Due Soon',
      'New Joiners',
      'Inactive',
    ][i],
  }));

  toggleEdit() {
    // Toggle the boolean state
    const isEnabled = !this.options.draggable!.enabled;

    this.options.draggable!.enabled = isEnabled;
    this.options.resizable!.enabled = isEnabled;

    // Set the grid visibility based on whether edit mode is active
    this.options.displayGrid = isEnabled ? 'always' : 'none';

    this.changedOptions();
  }

  getMockData(id: string): string {
    const values = [
      '1,240',
      '$45,200',
      '12',
      '45',
      '8',
      '88%',
      '34',
      '12',
      '5',
      '102',
    ];
    return values[parseInt(id) - 1] || '--';
  }
}
