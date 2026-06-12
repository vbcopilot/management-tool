import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterModule, GridsterConfig, GridsterItem } from 'angular-gridster2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // 1. Import GridsterModule here
  imports: [CommonModule, GridsterModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  // 2. Define your options and items
  options: GridsterConfig = {
    gridType: 'fit',
    displayGrid: 'always',
    pushItems: true,
    draggable: { enabled: true },
    resizable: { enabled: true },
  };

  dashboard: GridsterItem[] = [
    { cols: 2, rows: 1, y: 0, x: 0 },
    { cols: 2, rows: 2, y: 0, x: 2 }
  ];
}