// dashboard.model.ts

export type WidgetType = 'count' | 'pie' | 'bar' | 'line';

export type WidgetCategory =
  | 'Members'
  | 'Trainers'
  | 'Financials'
  | 'Operations';

export interface WidgetDefinition {
  widgetId: string;
  title: string;
  type: WidgetType;
  category: WidgetCategory;
  defaultCols: number;
  defaultRows: number;
  description: string;
}

export interface DashboardWidget {
  widgetId: string; // references WidgetDefinition.widgetId
  x: number;
  y: number;
  cols: number;
  rows: number;
}

export interface DashboardLayout {
  id: string; // always 'default' for now
  widgets: DashboardWidget[];
}

// ─── Widget Registry ─────────────────────────────────────────────────────────

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  // Members
  {
    widgetId: 'members-total',
    title: 'Total Members',
    type: 'count',
    category: 'Members',
    defaultCols: 1,
    defaultRows: 1,
    description: 'Total number of members in the system',
  },
  {
    widgetId: 'members-active-inactive',
    title: 'Active vs Inactive',
    type: 'pie',
    category: 'Members',
    defaultCols: 2,
    defaultRows: 2,
    description: 'Pie chart of active vs inactive members',
  },
  {
    widgetId: 'members-bmi',
    title: 'BMI Distribution',
    type: 'bar',
    category: 'Members',
    defaultCols: 2,
    defaultRows: 2,
    description: 'Overweight / Normal / Underweight breakdown',
  },
  {
    widgetId: 'members-new-this-month',
    title: 'New Joiners',
    type: 'count',
    category: 'Members',
    defaultCols: 1,
    defaultRows: 1,
    description: 'Members who joined this month',
  },
  {
    widgetId: 'members-age-distribution',
    title: 'Age Distribution',
    type: 'bar',
    category: 'Members',
    defaultCols: 2,
    defaultRows: 2,
    description: 'Age group breakdown of all members',
  },

  // Trainers
  {
    widgetId: 'trainers-total',
    title: 'Total Trainers',
    type: 'count',
    category: 'Trainers',
    defaultCols: 1,
    defaultRows: 1,
    description: 'Total number of trainers',
  },
  {
    widgetId: 'trainers-active-inactive',
    title: 'Trainer Status',
    type: 'pie',
    category: 'Trainers',
    defaultCols: 2,
    defaultRows: 2,
    description: 'Active vs inactive trainers',
  },
  {
    widgetId: 'trainers-avg-rating',
    title: 'Avg Trainer Rating',
    type: 'count',
    category: 'Trainers',
    defaultCols: 1,
    defaultRows: 1,
    description: 'Average rating across all trainers',
  },
  {
    widgetId: 'trainers-members-per-trainer',
    title: 'Members per Trainer',
    type: 'bar',
    category: 'Trainers',
    defaultCols: 3,
    defaultRows: 2,
    description: 'Assigned member count per trainer',
  },
  {
    widgetId: 'trainers-specialization',
    title: 'Specializations',
    type: 'pie',
    category: 'Trainers',
    defaultCols: 2,
    defaultRows: 2,
    description: 'Trainer specialization breakdown',
  },
  {
    widgetId: 'trainers-top-rated',
    title: 'Top Rated Trainers',
    type: 'bar',
    category: 'Trainers',
    defaultCols: 3,
    defaultRows: 2,
    description: 'Top 5 trainers by average member rating',
  },

  // Financials
  {
    widgetId: 'finance-total-paid',
    title: 'Total Salary Paid',
    type: 'count',
    category: 'Financials',
    defaultCols: 1,
    defaultRows: 1,
    description: 'Total salary disbursed to all trainers',
  },
  {
    widgetId: 'finance-pending-dues',
    title: 'Pending Dues',
    type: 'count',
    category: 'Financials',
    defaultCols: 1,
    defaultRows: 1,
    description: 'Total pending salary across all trainers',
  },
  {
    widgetId: 'finance-monthly-trend',
    title: 'Monthly Salary Trend',
    type: 'line',
    category: 'Financials',
    defaultCols: 3,
    defaultRows: 2,
    description: 'Monthly salary outflow over time',
  },
  {
    widgetId: 'finance-bonus-deduction',
    title: 'Bonus vs Deduction',
    type: 'bar',
    category: 'Financials',
    defaultCols: 2,
    defaultRows: 2,
    description: 'Total bonus vs deduction across all trainers',
  },

  // Operations
  {
    widgetId: 'ops-payment-status',
    title: 'Payment Status',
    type: 'pie',
    category: 'Operations',
    defaultCols: 2,
    defaultRows: 2,
    description: 'Paid / Partial / Pending / Advance breakdown',
  },
];

// ─── Default layout shown on first load ──────────────────────────────────────

export const DEFAULT_LAYOUT: DashboardWidget[] = [
  { widgetId: 'members-total', x: 0, y: 0, cols: 1, rows: 1 },
  { widgetId: 'trainers-total', x: 1, y: 0, cols: 1, rows: 1 },
  { widgetId: 'finance-total-paid', x: 2, y: 0, cols: 1, rows: 1 },
  { widgetId: 'finance-pending-dues', x: 3, y: 0, cols: 1, rows: 1 },
  { widgetId: 'trainers-avg-rating', x: 4, y: 0, cols: 1, rows: 1 },
  { widgetId: 'members-new-this-month', x: 5, y: 0, cols: 1, rows: 1 },
  { widgetId: 'members-active-inactive', x: 0, y: 1, cols: 2, rows: 2 },
  { widgetId: 'members-bmi', x: 2, y: 1, cols: 2, rows: 2 },
  { widgetId: 'trainers-active-inactive', x: 4, y: 1, cols: 2, rows: 2 },
  { widgetId: 'finance-monthly-trend', x: 0, y: 3, cols: 3, rows: 2 },
  { widgetId: 'trainers-members-per-trainer', x: 3, y: 3, cols: 3, rows: 2 },
  { widgetId: 'ops-payment-status', x: 0, y: 5, cols: 2, rows: 2 },
  { widgetId: 'finance-bonus-deduction', x: 2, y: 5, cols: 2, rows: 2 },
  { widgetId: 'trainers-top-rated', x: 4, y: 5, cols: 2, rows: 2 },
];
