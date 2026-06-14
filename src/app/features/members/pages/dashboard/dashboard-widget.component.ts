import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { WidgetDefinition } from '../../models/dashboard.model';
import { DashboardData } from '../../services/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="def && data">
      <div class="widget-inner" [class.edit-mode]="editMode">
        <div class="widget-header">
          <span class="widget-title">{{ def.title }}</span>
          <span class="widget-category">{{ def.category }}</span>
        </div>

        <!-- Count widget -->
        <div class="widget-count" *ngIf="def.type === 'count'">
          <div class="count-value">{{ countValue }}</div>
          <div class="count-sub" *ngIf="countSub">{{ countSub }}</div>
        </div>

        <!-- Chart widget -->
        <div class="widget-chart" *ngIf="def.type !== 'count'">
          <canvas #chartCanvas></canvas>
        </div>
      </div>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
      .widget-inner {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 12px 14px;
      }
      .widget-inner.edit-mode {
        padding-top: 26px;
        box-sizing: border-box;
      }
      .widget-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
        flex-shrink: 0;
      }
      .widget-title {
        font-size: 12px;
        font-weight: 500;
        color: #555;
        letter-spacing: 0.02em;
      }
      .widget-category {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: #f3f3f3;
        color: #999;
        border: 0.5px solid #e8e8e8;
      }
      .widget-count {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .count-value {
        font-size: 32px;
        font-weight: 700;
        color: #1a1a1a;
        line-height: 1;
      }
      .count-sub {
        font-size: 12px;
        color: #999;
        margin-top: 6px;
      }
      .widget-chart {
        flex: 1;
        position: relative;
        min-height: 0;
      }
      canvas {
        width: 100% !important;
        height: 100% !important;
      }
    `,
  ],
})
export class DashboardWidgetComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit
{
  @Input() def?: WidgetDefinition;
  @Input() data?: DashboardData;
  @Input() editMode = false;
  @ViewChild('chartCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  countValue = '—';
  countSub = '';
  private chart?: Chart;
  private chartBuilt = false;

  ngOnInit(): void {
    if (!this.def || !this.data) return;
    if (this.def.type === 'count') this.buildCount();
  }

  ngAfterViewInit(): void {
    if (!this.def || !this.data) return;
    if (this.def.type !== 'count') this.buildChart();
  }

  ngOnChanges(): void {
    if (!this.def || !this.data) return;
    if (this.def.type === 'count') {
      this.buildCount();
    } else if (this.chartBuilt && this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  // ── Count values ──────────────────────────────────────────────────────────

  private buildCount(): void {
    if (!this.data || !this.def) return;
    const d = this.data;
    switch (this.def.widgetId) {
      case 'members-total':
        this.countValue = d.totalMembers.toLocaleString();
        this.countSub = `${d.activeMembers} active · ${d.inactiveMembers} inactive`;
        break;
      case 'members-new-this-month':
        this.countValue = d.newMembersThisMonth.toLocaleString();
        this.countSub = 'joined this month';
        break;
      case 'trainers-total':
        this.countValue = d.totalTrainers.toLocaleString();
        this.countSub = `${d.activeTrainers} active · ${d.inactiveTrainers} inactive`;
        break;
      case 'trainers-avg-rating':
        this.countValue =
          d.avgTrainerRating != null ? `${d.avgTrainerRating} / 10` : '—';
        this.countSub = 'average member rating';
        break;
      case 'finance-total-paid':
        this.countValue = '₹' + d.totalSalaryPaid.toLocaleString('en-IN');
        this.countSub = 'total salary disbursed';
        break;
      case 'finance-pending-dues':
        this.countValue = '₹' + d.totalPendingDues.toLocaleString('en-IN');
        this.countSub = 'pending across all trainers';
        break;
      default:
        this.countValue = '—';
        this.countSub = '';
    }
  }

  // ── Chart ─────────────────────────────────────────────────────────────────

  private buildChart(): void {
    if (!this.canvasRef || !this.def || !this.data) return;
    const config = this.getChartConfig();
    if (!config) return;

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: config.type,
      data: config.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 11 }, boxWidth: 12 },
          },
          ...(config.options?.plugins ?? {}),
        },
        ...(config.options ?? {}),
      },
    });
    this.chartBuilt = true;
  }

  private updateChart(): void {
    if (!this.chart || !this.def || !this.data) return;
    const config = this.getChartConfig();
    if (!config) return;
    this.chart.data = config.data;
    this.chart.update();
  }

  private getChartConfig(): any {
    if (!this.data || !this.def) return null;
    const d = this.data;

    switch (this.def.widgetId) {
      case 'members-active-inactive':
        return {
          type: 'doughnut',
          data: {
            labels: ['Active', 'Inactive'],
            datasets: [
              {
                data: [d.activeMembers, d.inactiveMembers],
                backgroundColor: ['#4caf7d', '#e0e0e0'],
                borderWidth: 0,
              },
            ],
          },
        };

      case 'members-bmi':
        return {
          type: 'bar',
          data: {
            labels: ['Underweight', 'Normal', 'Overweight'],
            datasets: [
              {
                label: 'Members',
                data: [d.bmiUnderweight, d.bmiNormal, d.bmiOverweight],
                backgroundColor: ['#64b5f6', '#4caf7d', '#e57373'],
                borderRadius: 4,
              },
            ],
          },
          options: this.baseBarOptions(),
        };

      case 'members-age-distribution':
        return {
          type: 'bar',
          data: {
            labels: d.ageGroups.map((g: any) => g.label),
            datasets: [
              {
                label: 'Members',
                data: d.ageGroups.map((g: any) => g.count),
                backgroundColor: '#7986cb',
                borderRadius: 4,
              },
            ],
          },
          options: this.baseBarOptions(),
        };

      case 'trainers-active-inactive':
        return {
          type: 'doughnut',
          data: {
            labels: ['Active', 'Inactive'],
            datasets: [
              {
                data: [d.activeTrainers, d.inactiveTrainers],
                backgroundColor: ['#4caf7d', '#e0e0e0'],
                borderWidth: 0,
              },
            ],
          },
        };

      case 'trainers-members-per-trainer':
        return {
          type: 'bar',
          data: {
            labels: d.membersPerTrainer.map((t: any) => t.name),
            datasets: [
              {
                label: 'Assigned Members',
                data: d.membersPerTrainer.map((t: any) => t.count),
                backgroundColor: '#5c8de8',
                borderRadius: 4,
              },
            ],
          },
          options: this.baseBarOptions(),
        };

      case 'trainers-specialization':
        return {
          type: 'doughnut',
          data: {
            labels: d.specializations.map((s: any) => s.label),
            datasets: [
              {
                data: d.specializations.map((s: any) => s.count),
                backgroundColor: [
                  '#7986cb',
                  '#4db6ac',
                  '#ffb74d',
                  '#f06292',
                  '#a5d6a7',
                  '#ce93d8',
                ],
                borderWidth: 0,
              },
            ],
          },
        };

      case 'trainers-top-rated':
        return {
          type: 'bar',
          data: {
            labels: d.topRatedTrainers.map((t: any) => t.name),
            datasets: [
              {
                label: 'Rating / 10',
                data: d.topRatedTrainers.map((t: any) => t.rating),
                backgroundColor: '#e6a817',
                borderRadius: 4,
              },
            ],
          },
          options: {
            ...this.baseBarOptions(),
            scales: {
              y: {
                min: 0,
                max: 10,
                grid: { color: '#f0f0f0' },
                ticks: { font: { size: 10 } },
              },
              x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            },
          },
        };

      case 'finance-monthly-trend':
        return {
          type: 'line',
          data: {
            labels: d.monthlySalaryTrend.map((m: any) => m.month),
            datasets: [
              {
                label: 'Salary (₹)',
                data: d.monthlySalaryTrend.map((m: any) => m.amount),
                borderColor: '#5c8de8',
                backgroundColor: 'rgba(92,141,232,0.08)',
                tension: 0.4,
                fill: true,
                pointRadius: 3,
              },
            ],
          },
          options: this.baseLineOptions(),
        };

      case 'finance-bonus-deduction':
        return {
          type: 'bar',
          data: {
            labels: ['Total Bonus', 'Total Deduction'],
            datasets: [
              {
                data: [d.totalBonus, d.totalDeduction],
                backgroundColor: ['#4caf7d', '#e57373'],
                borderRadius: 4,
              },
            ],
          },
          options: {
            ...this.baseBarOptions(),
            plugins: { legend: { display: false } },
          },
        };

      case 'ops-payment-status':
        return {
          type: 'doughnut',
          data: {
            labels: d.paymentStatusBreakdown.map((s: any) => s.label),
            datasets: [
              {
                data: d.paymentStatusBreakdown.map((s: any) => s.count),
                backgroundColor: ['#4caf7d', '#ffb74d', '#e57373', '#64b5f6'],
                borderWidth: 0,
              },
            ],
          },
        };

      default:
        return null;
    }
  }

  private baseBarOptions(): any {
    return {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 10 } } },
      },
    };
  }

  private baseLineOptions(): any {
    return {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: {
          grid: { color: '#f0f0f0' },
          ticks: {
            font: { size: 10 },
            callback: (v: any) => '₹' + Number(v).toLocaleString('en-IN'),
          },
        },
      },
    };
  }
}

// ── ADD to @Input declarations (after existing @Input() data) ──────────────
// @Input() editMode = false;
//
// ── ADD to widget-inner style ─────────────────────────────────────────────
// .widget-inner.edit-mode { padding-top: 24px; }
//
// ── UPDATE template widget-inner div ─────────────────────────────────────
// <div class="widget-inner" [class.edit-mode]="editMode">
