import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ValueParserParams } from 'ag-grid-community';
import { ActionRendererComponent } from '../../../members/components/action-renderer.component';
import { LinkRendererComponent } from './link-rendered.component';

export class TrainerGridColumns {
  private static calculateDaysOfExperience(
    doj: string | Date | undefined
  ): number {
    if (!doj) return 0;

    const joiningDate = new Date(doj);
    const today = new Date();

    // Reset time to midnight to ensure accurate day calculation
    joiningDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Calculate the difference in milliseconds
    const diffInMs = today.getTime() - joiningDate.getTime();

    // Convert milliseconds to days (1000ms * 60s * 60m * 24h)
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays >= 0 ? diffInDays : 0;
  }
  static build(): ColDef[] {
    return [
      // --- TEXT FIELDS ---
      { field: 'name', headerName: 'Name', editable: true },
      {
        field: 'speaciality',
        headerName: 'Speaciality',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: [
            'Cardio',
            'Yoga',
            'Weight Loss',
            'Strength',
            'Body Building',
            'Asthetics',
            'Other',
          ],
        },
      },
      { field: 'phoneNumber', headerName: 'Phone No', editable: true },
      { field: 'email', headerName: 'Email', editable: true },

      // --- DROPDOWN FIELDS ---
      {
        field: 'doj',
        headerName: 'Date of Joining',
        editable: true,
        cellEditor: 'agDateCellEditor',
      },
      {
        field: 'status',
        headerName: 'Status',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: ['Active', 'Inactive'] },
      },

      // --- AUTO-CALCULATED ---
      {
        field: 'daysOfExperience',
        headerName: 'Experience (Days)',
        editable: false,
        valueGetter: (params) =>
          TrainerGridColumns.calculateDaysOfExperience(params.data?.doj),
      },

      // --- COMPLEX FIELDS (Hyperlinks) ---
      // Note: You will need a custom CellRenderer for these to render as <a> tags
      {
        field: 'membersAssigned',
        headerName: 'Members',
        // Pass the CLASS, not a string
        cellRenderer: LinkRendererComponent,
        editable: false,
        valueGetter: (params) => params.data.assignedMemberCount || 0,
      },
      {
        field: 'avgRating',
        headerName: 'Avg Rating',
        cellRenderer: 'linkRenderer',
      },
      {
        field: 'classesCompleted',
        headerName: 'Classes',
        cellRenderer: 'linkRenderer',
      },
      { field: 'dues', headerName: 'Dues', cellRenderer: 'linkRenderer' },

      {
        headerName: 'Actions',
        cellRenderer: ActionRendererComponent,
        pinned: 'right',
        width: 160,
      },
    ];
  }
}
