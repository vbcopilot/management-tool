import { Component, Input } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, RowValueChangedEvent } from 'ag-grid-community'; // Added RowValueChangedEvent for better typing
import { Member } from '../../models/member.model';
import { MemberGridColumns } from './member-grid.columns';
import { MemberFacadeService } from '../../services/member-facade.service';

@Component({
  selector: 'app-member-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './member-grid.component.html',
})
export class MemberGridComponent {
  @Input({ required: true })
  members!: Member[];

  readonly columnDefs: ColDef[] = MemberGridColumns.build();

  constructor(private readonly facade: MemberFacadeService) {}

  gridOptions = {
    singleClickEdit: true,
    stopEditingWhenCellsLoseFocus: true,
    editType: 'fullRow', // Note: onRowValueChanged requires editType: 'fullRow' to trigger in ag-Grid

    getRowId: (params: any) => params.data.id,

    onRowValueChanged: (event: RowValueChangedEvent) => {
      this.onRowChanged(event.data);
    },
  } as const;

  // ADD THIS METHOD to resolve the TS error
  async onRowChanged(updatedMember: Member) {
    console.log('Member data updated:', updatedMember);
    await this.facade.saveMember(updatedMember);
  }
}
