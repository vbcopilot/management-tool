// dashboard-layout.service.ts
import { Injectable } from '@angular/core';
import { db } from '../../../core/db/app-db';
import {
  DEFAULT_LAYOUT,
  DashboardLayout,
  DashboardWidget,
} from '../models/dashboard.model';

const LAYOUT_ID = 'default';

@Injectable({ providedIn: 'root' })
export class DashboardLayoutService {
  async load(): Promise<DashboardWidget[]> {
    const saved = (await (db as any).dashboardLayouts.get(LAYOUT_ID)) as
      | DashboardLayout
      | undefined;
    return saved?.widgets ?? DEFAULT_LAYOUT;
  }

  async save(widgets: DashboardWidget[]): Promise<void> {
    await (db as any).dashboardLayouts.put({ id: LAYOUT_ID, widgets });
  }

  async reset(): Promise<void> {
    await (db as any).dashboardLayouts.delete(LAYOUT_ID);
  }
}
