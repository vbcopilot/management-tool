import { ColDef } from 'ag-grid-community';
import { ActionRendererComponent } from '../../../members/components/action-renderer.component';
import { LinkRendererComponent } from './link-rendered.component';

export class TrainerGridColumns {
  private static calculateDaysOfExperience(
    doj: string | Date | undefined
  ): number {
    if (!doj) return 0;
    const joiningDate = new Date(doj);
    const today = new Date();
    joiningDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffInMs = today.getTime() - joiningDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays >= 0 ? diffInDays : 0;
  }

  static build(): ColDef[] {
    return [
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
      {
        field: 'daysOfExperience',
        headerName: 'Experience (Days)',
        editable: false,
        valueGetter: (params) =>
          TrainerGridColumns.calculateDaysOfExperience(params.data?.doj),
      },

      // ✅ Members count — reads membersAssigned array length from DB
      {
        field: 'membersAssigned',
        headerName: 'Members',
        cellRenderer: LinkRendererComponent,
        editable: false,
        valueGetter: (params) =>
          Array.isArray(params.data?.membersAssigned)
            ? params.data.membersAssigned.filter((m: any) => m.isAssigned)
                .length
            : 0,
      },

      {
        field: 'averageRating',
        headerName: 'Avg Rating',
        editable: false,
        cellRenderer: LinkRendererComponent,
        valueGetter: (params) =>
          params.data?.averageRating != null
            ? params.data.averageRating + ' / 10'
            : 'N/a',
      },
      {
        field: 'classesCompleted',
        headerName: 'Classes',
        cellRenderer: LinkRendererComponent,
      },
      {
        field: 'dues',
        headerName: 'Dues',
        cellRenderer: LinkRendererComponent,
        editable: false,
        valueGetter: (params) =>
          params.data?.totalDuesPaid != null
            ? '₹' + params.data.totalDuesPaid.toLocaleString('en-IN')
            : '₹0',
      },
      {
        headerName: 'Actions',
        cellRenderer: ActionRendererComponent,
        pinned: 'right',
        width: 160,
      },
    ];
  }
}
