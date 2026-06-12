import { Component, Input } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, RowValueChangedEvent } from 'ag-grid-community';
import { TrainerGridColumns } from './trainer-grid.columns';
import { TrainerFacadeService } from '../../../members/services/trainer-facade.service';
import { Trainer } from '../../../members/models/trainer.model';
import { LinkRendererComponent } from './link-rendered.component';

@Component({
  selector: 'app-member-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './trainer-grid.component.html',
})
export class TrainerGridComponent {
  @Input({ required: true })
  members!: Trainer[];

  readonly columnDefs: ColDef[] = TrainerGridColumns.build();

  constructor(private readonly facade: TrainerFacadeService) {}

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
  async onRowChanged(updatedTrainer: Trainer) {
    console.log('Member data updated:', updatedTrainer);
    await this.facade.saveTrainer(updatedTrainer);
  }
}
