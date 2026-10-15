import { Component } from '@angular/core';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="progress-page">
      <!-- Header -->
      <header class="progress-header">
        <div>
          <h2>Performance & Progress</h2>
          <p class="sub">Empirical trajectory across strength, body composition, consistency, and wellbeing.</p>
        </div>

        <div class="range-selector">
          <select class="select-pill" aria-label="Select date range">
            <option>Last 12 weeks</option>
            <option>Last 6 months</option>
            <option>Year to date</option>
            <option>All time</option>
          </select>
        </div>
      </header>

      <!-- 4 Top KPI Cards (From Reference Mockup) -->
      <div class="kpi-grid">
        <!-- 1. Strength -->
        <div class="kpi-card card">
          <div class="kpi-head">
            <span class="kpi-lbl">Strength</span>
            <span class="kpi-val num stat-cyan">+24%</span>
            <span class="kpi-sub">Est. 1RM</span>
          </div>
          <div class="mini-bar-chart">
            <div class="m-bar" style="height: 35%"></div>
            <div class="m-bar" style="height: 50%"></div>
            <div class="m-bar" style="height: 65%"></div>
            <div class="m-bar" style="height: 80%"></div>
            <div class="m-bar" style="height: 95%"></div>
          </div>
        </div>

        <!-- 2. Body Composition -->
        <div class="kpi-card card">
          <div class="kpi-head">
            <span class="kpi-lbl">Body Composition</span>
            <span class="kpi-val num stat-green">-6%</span>
            <span class="kpi-sub">Body fat</span>
          </div>
          <div class="mini-line-chart">
            <svg viewBox="0 0 100 40" class="spark-svg">
              <path d="M0,10 Q25,12 50,22 T100,34" fill="none" stroke="var(--primary)" stroke-width="2.5" />
            </svg>
          </div>
        </div>

        <!-- 3. Consistency -->
        <div class="kpi-card card">
          <div class="kpi-head">
            <span class="kpi-lbl">Consistency</span>
            <span class="kpi-val num stat-orange">5 / 7</span>
            <span class="kpi-sub">Workouts per week</span>
          </div>
          <div class="mini-bar-chart orange-bars">
            <div class="m-bar" style="height: 70%"></div>
            <div class="m-bar" style="height: 90%"></div>
            <div class="m-bar" style="height: 75%"></div>
            <div class="m-bar" style="height: 85%"></div>
            <div class="m-bar" style="height: 100%"></div>
          </div>
        </div>

        <!-- 4. Wellbeing -->
        <div class="kpi-card card">
          <div class="kpi-head">
            <span class="kpi-lbl">Wellbeing</span>
            <span class="kpi-val num stat-cyan">+18%</span>
            <span class="kpi-sub">Readiness</span>
          </div>
          <div class="mini-line-chart">
            <svg viewBox="0 0 100 40" class="spark-svg">
              <path d="M0,32 Q30,28 60,18 T100,8" fill="none" stroke="var(--accent-1)" stroke-width="2.5" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Main Long-term Workout Volume Chart (From Reference Mockup) -->
      <section class="total-workouts-card card">
        <div class="tw-header">
          <div class="tw-left">
            <span class="tw-title">Total Workouts</span>
            <div class="tw-num-row">
              <span class="tw-large num">48</span>
              <span class="tw-delta num">+33% vs. previous 12 weeks</span>
            </div>
          </div>
          <button class="btn btn-secondary" (click)="exportSummary()">
            <app-icon name="trophy" [size]="16" />
            <span>Export Summary</span>
          </button>
        </div>

        <div class="main-bar-chart">
          <div class="chart-columns">
            @for (w of weeklyWorkouts; track $index) {
              <div class="w-col">
                <div class="w-fill" [style.height.%]="w.pct"></div>
              </div>
            }
          </div>
          <div class="months-labels">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .progress-page {
      max-width: 1300px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
    }
    .progress-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-4);
      flex-wrap: wrap;
    }
    .sub {
      font-size: var(--fs-sm);
      color: var(--text-muted);
    }
    .select-pill {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 8px 16px;
      color: var(--text);
      font-size: var(--fs-xs);
      font-weight: 600;
      cursor: pointer;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--s-4);
    }
    .kpi-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 160px;
    }
    .kpi-head {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .kpi-lbl {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      font-weight: 600;
    }
    .kpi-val {
      font-family: var(--font-display);
      font-size: 1.8rem;
      font-weight: 800;
      line-height: 1.1;
    }
    .kpi-sub {
      font-size: 0.7rem;
      color: var(--text-faint);
    }

    .stat-cyan { color: var(--accent-1); }
    .stat-green { color: var(--primary); }
    .stat-orange { color: var(--accent-2); }

    .mini-bar-chart {
      height: 48px;
      display: flex;
      align-items: flex-end;
      gap: 6px;
    }
    .m-bar {
      flex: 1;
      background: var(--accent-1);
      border-radius: 2px 2px 0 0;
    }
    .orange-bars .m-bar {
      background: var(--accent-2);
    }

    .mini-line-chart {
      height: 48px;
      display: flex;
      align-items: center;
    }
    .spark-svg {
      width: 100%;
      height: 38px;
    }

    /* Total Workouts Card */
    .total-workouts-card {
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
      padding: var(--s-5);
    }
    .tw-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--s-3);
    }
    .tw-left {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tw-title {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .tw-num-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }
    .tw-large {
      font-family: var(--font-display);
      font-size: 2.8rem;
      font-weight: 800;
      color: var(--text);
      line-height: 1;
    }
    .tw-delta {
      font-size: var(--fs-sm);
      color: var(--primary);
      font-weight: 600;
    }

    .main-bar-chart {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .chart-columns {
      height: 160px;
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }
    .w-col {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: flex-end;
    }
    .w-fill {
      width: 100%;
      background: var(--accent-1);
      border-radius: 4px 4px 0 0;
      transition: height var(--t-fast) var(--ease);
    }
    .w-fill:hover {
      background: var(--primary);
    }
    .months-labels {
      display: flex;
      justify-content: space-between;
      font-size: var(--fs-xs);
      color: var(--text-faint);
      padding: 0 4px;
    }

    @media (max-width: 1024px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 600px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProgressComponent {
  weeklyWorkouts = [
    { pct: 25 }, { pct: 40 }, { pct: 30 }, { pct: 60 },
    { pct: 45 }, { pct: 75 }, { pct: 55 }, { pct: 85 },
    { pct: 70 }, { pct: 90 }, { pct: 65 }, { pct: 95 },
    { pct: 80 }, { pct: 92 }, { pct: 88 }, { pct: 100 }
  ];

  exportSummary() {
    alert('Summary exported! Training history, PRs, and body metrics compiled to CSV.');
  }
}
