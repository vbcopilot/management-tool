import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ValueParserParams } from 'ag-grid-community';
import { ActionRendererComponent } from '../action-renderer.component';
import { MemberValidator } from './member-grid-validator';

export class MemberGridColumns {
  static build(): ColDef[] {
    return [
      {
        field: 'name',
        headerName: 'Name',
        editable: true,
        cellEditor: 'agTextCellEditor',
        valueSetter: (params) => {
          const newValue = params.newValue.trim();
          if (newValue.length === 0) {
            return false; // Prevent empty names
          }
          params.data.name = newValue;
          return true;
        },
      },
      {
        field: 'age',
        headerName: 'Age',
        editable: true,
        valueParser: MemberGridColumns.numberParser,
        valueSetter: (params) => {
          const newValue = Number(params.newValue);
          if (isNaN(newValue) || newValue <= 0) {
            return false;
          }
          params.data.age = newValue;
          return true;
        },
      },
      // INPUT FIELDS (Triggers calculations)
      {
        field: 'height',
        headerName: 'Height (cm)',
        editable: true,
        cellEditor: 'agNumberCellEditor',
        valueSetter: MemberValidator.setHeight,
      },
      {
        field: 'weight',
        headerName: 'Weight (kg)',
        editable: true,
        cellEditor: 'agNumberCellEditor',
        valueSetter: MemberValidator.setWeight,
      },
      // AUTO-GENERATED FITNESS METRICS (Read-only status)
      {
        field: 'bmi',
        headerName: 'BMI',
        editable: false,
        valueFormatter: (p) =>
          p.value ? `${p.value} (${p.data.bmiCategory || ''})` : '-',
      },
      {
        field: 'idealWeight',
        headerName: 'Ideal Weight',
        editable: false,
        valueFormatter: (p) => (p.value ? `${p.value} kg` : '-'),
      },
      {
        field: 'dailyCalories',
        headerName: 'Target Calories',
        editable: false,
        valueFormatter: (p) => (p.value ? `${p.value} kcal` : '-'),
      },
      {
        field: 'dailyProteinGrams',
        headerName: 'Daily Protein',
        editable: false,
        valueFormatter: (p) => (p.value ? `${p.value} g` : '-'),
      },
      {
        field: 'dailyWaterLiters',
        headerName: 'Water Goal',
        editable: false,
        valueFormatter: (p) => (p.value ? `${p.value} L` : '-'),
      },
      {
        headerName: 'Actions',
        cellRenderer: ActionRendererComponent,
        editable: false,
        sortable: false,
        filter: false,
        resizable: false, // Prevents users from shrinking it until buttons hide
        pinned: 'right', // Optional: Keeps actions always visible on the far right if scrolling horizontally
        width: 160, // Fixed width ensures both Save and Delete fit comfortably side-by-side
        minWidth: 160,
        maxWidth: 180,
      },
    ];
  }

  private static numberParser(params: ValueParserParams): number {
    const newValue = Number(params.newValue);
    return isNaN(newValue) ? params.oldValue : newValue;
  }
}
