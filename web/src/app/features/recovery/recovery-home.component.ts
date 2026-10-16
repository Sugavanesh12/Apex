import { Component, computed, inject } from '@angular/core';
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
        <a routerLink="/recovery/checkin" class="btn btn-primary checkin-btn">
          <app-icon name="plus" [size]="16" />
          <span>Daily Check-in</span>
        </a>
      </header>

      <div class="recovery-grid">
        <!-- Main Readiness Dial & Why Score -->
        <div class="card readiness-card">
          <div class="card-head">
            <h3>Readiness Score</h3>
            <span class="badge" [class]="badgeClass()">{{ badgeLabel() }}</span>
          </div>

          <div class="score-display-row">
            <app-progress-ring
              [value]="readinessScore()"
              [size]="160"
              [strokeWidth]="12"
              [strokeColor]="ringStrokeColor()"
              trackColor="var(--surface-3)"
              label="Overall Readiness"
            >
              <span class="score-big num" [style.color]="ringStrokeColor()">{{ readinessScore() }}</span>
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
                      <div
                        class="progress-bar-fill"
                        [style.width.%]="factor.score"
                        [style.background]="getFactorBarColor(factor.score)"
                      ></div>
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
            <div class="trend-head-title">
              <h3>14-Day Readiness Trend</h3>
              <span class="today-indicator-pill">Today: {{ readinessScore() }}</span>
            </div>
            <span class="badge badge-cyan">Avg {{ recovery.trendAvg() }}</span>
          </div>

          <div class="trend-chart">
            <div class="chart-bars">
              @for (day of recovery.trendHistory(); track $index) {
                <div class="t-col" [class.today-col]="$index === recovery.trendHistory().length - 1">
                  <div
                    class="t-bar"
                    [class.today-bar]="$index === recovery.trendHistory().length - 1"
                    [style.height.%]="day"
                    [style.background]="getBarColor(day, $index === recovery.trendHistory().length - 1)"
                  ></div>
                  <span class="t-lbl num" [class.today-lbl]="$index === recovery.trendHistory().length - 1">
                    {{ day }}
                  </span>
                </div>
              }
            </div>
          </div>

          <div class="trend-insights">
            <app-icon name="info" [size]="14" [color]="ringStrokeColor()" />
            <span>{{ recovery.recoveryInsight() }}</span>
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

    .trend-head-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .today-indicator-pill {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--primary);
      background: rgba(204, 255, 0, 0.1);
      border: 1px solid rgba(204, 255, 0, 0.3);
      padding: 2px 8px;
      border-radius: 9999px;
      letter-spacing: 0.02em;
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
      transition: color 0.2s ease;
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
      transition: height var(--t-fast) var(--ease), background 0.2s ease;
    }
    .t-col:hover .t-bar {
      filter: brightness(1.2);
    }
    .t-bar.today-bar {
      box-shadow: 0 0 10px rgba(204, 255, 0, 0.4);
    }
    .t-lbl {
      font-size: 0.6rem;
      color: var(--text-faint);
    }
    .t-lbl.today-lbl {
      color: var(--primary);
      font-weight: 800;
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
      line-height: 1.4;
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

    @media (max-width: 500px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .checkin-btn {
        width: 100%;
        justify-content: center;
      }
      .score-display-row {
        gap: var(--s-3);
      }
      .why-score {
        width: 100%;
        text-align: left;
      }
      .factor-item {
        grid-template-columns: 80px 48px 1fr;
        font-size: 0.72rem;
      }
      .recovery-page {
        padding-bottom: 24px;
      }
    }
  `]
})
export class RecoveryHomeComponent {
  user = inject(UserService);
  recovery = inject(RecoveryService);

  readinessScore = computed(() => this.recovery.readinessScore());

  badgeLabel = computed(() => this.recovery.readinessBadge().label);
  badgeClass = computed(() => this.recovery.readinessBadge().class);

  ringStrokeColor = computed(() => {
    const s = this.readinessScore();
    if (s >= 80) return 'var(--primary, #ccff00)';
    if (s >= 65) return 'var(--accent-1, #38bdf8)';
    return '#ef4444';
  });

  getFactorBarColor(score: number): string {
    if (score >= 75) return 'var(--primary, #ccff00)';
    if (score >= 50) return 'var(--accent-1, #38bdf8)';
    return '#ef4444';
  }

  getBarColor(score: number, isToday: boolean): string {
    if (isToday) {
      return this.ringStrokeColor();
    }
    return 'var(--surface-3, rgba(255, 255, 255, 0.12))';
  }
}
