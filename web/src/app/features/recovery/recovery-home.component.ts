import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { ProgressRingComponent } from '../../shared/ui/progress-ring/progress-ring.component';
import { RecoveryService } from '../../core/services/recovery.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-recovery-home',
  standalone: true,
  imports: [RouterLink, IconComponent, ProgressRingComponent],
  template: `
    <div class="recovery-home-page">
      <header class="page-header">
        <div>
          <h2>Recovery & Readiness</h2>
          <p class="sub">Empirical recovery modeling across sleep, autonomic nervous system, and training fatigue.</p>
        </div>
        <a routerLink="/recovery/checkin" class="btn btn-primary">
          <app-icon name="plus" [size]="16" />
          <span>Daily Check-in</span>
        </a>
      </header>

      <div class="recovery-grid">
        <!-- Main Readiness Dial & Why Score -->
        <div class="card readiness-card">
          <div class="card-head">
            <h3>Readiness Score</h3>
            <span class="badge badge-primary">Optimal Recovery</span>
          </div>

          <div class="score-display-row">
            <app-progress-ring
              [value]="user.profile().readiness"
              [size]="160"
              [strokeWidth]="12"
              strokeColor="var(--primary)"
              trackColor="var(--surface-3)"
              label="Overall Readiness"
            >
              <span class="score-big num">{{ user.profile().readiness }}</span>
              <span class="score-sub">READINESS</span>
            </app-progress-ring>

            <div class="why-score">
              <h4>Why this score?</h4>
              <p class="why-desc">{{ recovery.readinessResult().reason }}</p>

              <div class="factors-list">
                @for (factor of recovery.readinessResult().factors; track factor.key) {
                  <div class="factor-item">
                    <span class="f-lbl">{{ factor.label }}</span>
                    <span class="f-note num">{{ factor.note }}</span>
                    <div class="progress-bar-bg f-bar">
                      <div class="progress-bar-fill" [style.width.%]="factor.score" style="background: var(--primary);"></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- 14-day Trend Chart -->
        <div class="card trend-card">
          <div class="card-head">
            <h3>14-Day Readiness Trend</h3>
            <span class="badge badge-cyan">Avg 84</span>
          </div>

          <div class="trend-chart">
            <div class="chart-bars">
              @for (day of [78, 82, 85, 79, 88, 90, 86, 84, 82, 89, 91, 85, 87, 86]; track $index) {
                <div class="t-col">
                  <div class="t-bar" [style.height.%]="day"></div>
                  <span class="t-lbl num">{{ day }}</span>
                </div>
              }
            </div>
          </div>

          <div class="trend-insights">
            <app-icon name="info" [size]="14" color="var(--primary)" />
            <span>Sleep consistency is your biggest recovery multiplier this week (+6 points).</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recovery-home-page {
      max-width: 1300px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
    }
    .page-header {
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

    .recovery-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: var(--s-4);
    }

    .readiness-card, .trend-card {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .score-display-row {
      display: flex;
      align-items: center;
      gap: var(--s-6);
      padding: var(--s-3) 0;
    }
    .score-big {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text);
      line-height: 1;
    }
    .score-sub {
      font-size: 0.65rem;
      color: var(--text-muted);
      letter-spacing: 0.1em;
      margin-top: 4px;
    }

    .why-score {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .why-score h4 {
      font-size: var(--fs-sm);
    }
    .why-desc {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      line-height: 1.4;
    }

    .factors-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 6px;
    }
    .factor-item {
      display: grid;
      grid-template-columns: 90px 60px 1fr;
      align-items: center;
      gap: 8px;
      font-size: var(--fs-xs);
    }
    .f-lbl {
      color: var(--text-muted);
    }
    .f-note {
      color: var(--text);
      font-weight: 600;
    }
    .f-bar {
      height: 5px;
    }

    /* Trend Chart */
    .trend-chart {
      height: 180px;
      padding: var(--s-4) 0;
      display: flex;
      align-items: flex-end;
    }
    .chart-bars {
      width: 100%;
      height: 140px;
      display: flex;
      align-items: flex-end;
      gap: 6px;
    }
    .t-col {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
    }
    .t-bar {
      width: 100%;
      background: var(--surface-3);
      border-radius: 3px 3px 0 0;
      transition: height var(--t-fast) var(--ease);
    }
    .t-col:hover .t-bar {
      background: var(--accent-1);
    }
    .t-lbl {
      font-size: 0.6rem;
      color: var(--text-faint);
    }

    .trend-insights {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-input);
      padding: 10px 14px;
      font-size: var(--fs-xs);
      color: var(--text-muted);
    }

    @media (max-width: 900px) {
      .recovery-grid {
        grid-template-columns: 1fr;
      }
      .score-display-row {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class RecoveryHomeComponent {
  user = inject(UserService);
  recovery = inject(RecoveryService);
}
