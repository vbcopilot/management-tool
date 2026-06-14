import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GridsterConfig,
  GridsterItem,
  GridsterModule,
  CompactType,
  DisplayGrid,
} from 'angular-gridster2';
import { DashboardWidgetComponent } from './dashboard-widget.component';
import {
  DashboardData,
  DashboardService,
} from '../../services/dashboard.service';
import { DashboardLayoutService } from '../../services/dashboard-layout.service';
import {
  DEFAULT_LAYOUT,
  DashboardWidget,
  WIDGET_REGISTRY,
  WidgetCategory,
  WidgetDefinition,
} from '../../models/dashboard.model';

export interface GridItem extends GridsterItem {
  widgetId: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, GridsterModule, DashboardWidgetComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardPage implements OnInit, OnDestroy {
  isEditMode = false;
  showAddPanel = false;
  isLoading = true;
  isSaving = false;

  data!: DashboardData;
  grid: GridItem[] = [];

  readonly registry = WIDGET_REGISTRY;
  readonly categories: WidgetCategory[] = [
    'Members',
    'Trainers',
    'Financials',
    'Operations',
  ];
  activeCategory: WidgetCategory = 'Members';

  options: GridsterConfig = {
    gridType: 'scrollVertical' as any,
    compactType: 'compactLeft&Up' as CompactType,
    displayGrid: 'none' as DisplayGrid,

    // Columns — fixed 6, no horizontal scroll ever
    minCols: 6,
    maxCols: 6,
    fixedColWidth: 100, // ignored in scrollVertical but needed for init

    // Rows
    minRows: 6,
    fixedRowHeight: 150,

    // Margins
    margin: 10,
    outerMargin: true,
    outerMarginTop: 10,
    outerMarginRight: 10,
    outerMarginBottom: 10,
    outerMarginLeft: 10,

    // Push behaviour
    pushItems: true,
    pushDirections: { north: true, east: true, south: true, west: true },
    pushResizeItems: false,
    swap: false,
    swapWhileDragging: false,

    // Drag — use handle so chart interactions don't trigger drag
    draggable: {
      enabled: true,
      ignoreContent: true,
      dragHandleClass: 'db-drag-handle',
      dropOverItems: false,
    },

    // Resize
    resizable: {
      enabled: false,
    },

    // Scroll
    disableScrollHorizontal: true,
    disableScrollVertical: false,

    // Callbacks
    itemChangeCallback: (item) => this.onItemChanged(item),
    itemResizeCallback: (item) => this.onItemChanged(item),
  };

  constructor(
    private readonly dashboardSvc: DashboardService,
    private readonly layoutSvc: DashboardLayoutService,
    private readonly cdr: ChangeDetectorRef,
    private readonly zone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    const [data, widgets] = await Promise.all([
      this.dashboardSvc.computeAll(),
      this.layoutSvc.load(),
    ]);
    this.data = data;
    // Filter out any saved widgetIds that no longer exist in the registry
    this.grid = widgets
      .filter((w) => WIDGET_REGISTRY.some((r) => r.widgetId === w.widgetId))
      .map((w) => ({ ...w }));
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {}

  // ── Accessors ──────────────────────────────────────────────────────────────

  getDef(widgetId: string): WidgetDefinition | undefined {
    return WIDGET_REGISTRY.find((w) => w.widgetId === widgetId);
  }

  widgetsInCategory(cat: WidgetCategory): WidgetDefinition[] {
    return this.registry.filter((w) => w.category === cat);
  }

  isOnDashboard(widgetId: string): boolean {
    return this.grid.some((g) => g.widgetId === widgetId);
  }

  trackByWidgetId(_: number, item: GridItem): string {
    return item.widgetId;
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────

  toggleEdit(): void {
    this.isEditMode = !this.isEditMode;
    this.options.draggable!.enabled = this.isEditMode;
    this.options.resizable!.enabled = this.isEditMode;
    this.options.displayGrid = this.isEditMode
      ? ('always' as DisplayGrid)
      : ('none' as DisplayGrid);
    this.applyOptions();

    if (!this.isEditMode) {
      this.showAddPanel = false;
      this.persistLayout();
    }
  }

  toggleAddPanel(): void {
    this.showAddPanel = !this.showAddPanel;
  }

  // ── Add widget ─────────────────────────────────────────────────────────────

  addWidget(def: WidgetDefinition): void {
    if (this.isOnDashboard(def.widgetId)) return;

    const item: GridItem = {
      widgetId: def.widgetId,
      cols: def.defaultCols,
      rows: def.defaultRows,
      x: 0,
      y: 0,
    };

    // Prepend — compactLeft&Up will reflow everything neatly
    this.grid = [item, ...this.grid];
    this.cdr.detectChanges();
    this.persistLayout();
  }

  // ── Remove widget ──────────────────────────────────────────────────────────

  removeWidget(widgetId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.grid = this.grid.filter((g) => g.widgetId !== widgetId);
    this.cdr.detectChanges();
    this.persistLayout();
  }

  // ── Reset ──────────────────────────────────────────────────────────────────

  async resetLayout(): Promise<void> {
    await this.layoutSvc.reset();
    this.grid = DEFAULT_LAYOUT.filter((w) =>
      WIDGET_REGISTRY.some((r) => r.widgetId === w.widgetId)
    ).map((w) => ({ ...w }));
    this.applyOptions();
    this.cdr.detectChanges();
  }

  // ── Refresh data ───────────────────────────────────────────────────────────

  async refreshData(): Promise<void> {
    this.data = await this.dashboardSvc.computeAll();
    this.cdr.detectChanges();
  }

  // ── Layout persistence ─────────────────────────────────────────────────────

  private onItemChanged(_item: GridsterItem): void {
    if (this.isEditMode) this.persistLayout();
  }

  private persistLayout(): void {
    const widgets: DashboardWidget[] = this.grid.map((g) => ({
      widgetId: g.widgetId,
      x: g.x ?? 0,
      y: g.y ?? 0,
      cols: g.cols ?? 1,
      rows: g.rows ?? 1,
    }));
    // fire-and-forget
    this.layoutSvc.save(widgets);
  }

  private applyOptions(): void {
    this.options.api?.optionsChanged?.();
  }
}
