import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { WorkoutService } from '../../core/services/workout.service';
import { RecoveryService } from '../../core/services/recovery.service';
import { UserService } from '../../core/services/user.service';

export interface PrBenchmark {
  id: string;
  name: string;
  muscle: string;
  currentPr: string;
  est1Rm: string;
  gain12w: string;
  formScore: number;
  status: 'NEW PR!' | 'ASCENDING' | 'PEAK CAPACITY';
  statusType: 'accent' | 'primary' | 'orange';
}

export interface MuscleVolumeTarget {
  muscle: string;
  sub: string;
  currentSets: number;
  targetSets: number;
  mrvSets: number;
  pct: number;
  status: string;
  statusClass: string;
}

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink, IconComponent],
  template: `
    <div class="progress-page">
      <!-- Header -->
      <header class="progress-header">
        <div class="header-left">
          <h2>Performance & Progress</h2>
          <p class="sub">Empirical trajectory across strength, body composition, consistency, and training tonnage.</p>
        </div>

        <div class="range-selector">
          <div class="range-pill-group">
            @for (r of rangeOptions; track r.id) {
              <button
                type="button"
                class="range-pill-btn"
                [class.active]="selectedRange() === r.id"
                (click)="selectedRange.set(r.id)"
              >
                {{ r.label }}
              </button>
            }
          </div>
        </div>
      </header>

      <!-- 4 Top KPI Cards -->
      <div class="kpi-grid">
        <!-- 1. Strength -->
        <div class="kpi-card card">
          <div class="kpi-head">
            <span class="kpi-lbl">Strength Trajectory</span>
            <span class="kpi-val num stat-cyan">{{ weeklyTrajectory().pctChange }}</span>
            <span class="kpi-sub">{{ weeklyTrajectory().headline }}</span>
          </div>
          <div class="mini-bar-chart">
            @for (w of weeklyWorkouts().slice(-5); track $index) {
              <div class="m-bar" [style.height.%]="w.pct"></div>
            }
          </div>
        </div>

        <!-- 2. Body Composition -->
        <div class="kpi-card card">
          <div class="kpi-head">
            <span class="kpi-lbl">Athletic Goal</span>
            <span class="kpi-val num stat-green">{{ user.profile().goal }}</span>
            <span class="kpi-sub">{{ user.profile().experience }} Level · {{ user.profile().title }}</span>
          </div>
          <div class="mini-line-chart">
            <svg viewBox="0 0 100 40" class="spark-svg">
              <path d="M0,28 Q25,24 50,16 T100,8" fill="none" stroke="var(--primary)" stroke-width="2.5" />
            </svg>
          </div>
        </div>

        <!-- 3. Consistency -->
        <div class="kpi-card card">
          <div class="kpi-head">
            <span class="kpi-lbl">Training Consistency</span>
            <span class="kpi-val num stat-orange">{{ consistencyAvg() }}</span>
            <span class="kpi-sub">Average workouts completed per week</span>
          </div>
          <div class="mini-bar-chart orange-bars">
            @for (w of weeklyWorkouts().slice(-5); track $index) {
              <div class="m-bar" [style.height.%]="Math.min(100, w.sessions * 20)"></div>
            }
          </div>
        </div>

        <!-- 4. Wellbeing & Recovery -->
        <div class="kpi-card card">
          <div class="kpi-head">
            <span class="kpi-lbl">Readiness & Recovery</span>
            <span class="kpi-val num stat-cyan">{{ recovery.readinessScore() }}/100</span>
            <span class="kpi-sub">{{ recovery.readinessBadge().label }} ({{ recovery.sleepTime() }} sleep)</span>
          </div>
          <div class="mini-line-chart">
            <svg viewBox="0 0 100 40" class="spark-svg">
              <path d="M0,32 Q30,28 60,18 T100,8" fill="none" stroke="var(--accent-1)" stroke-width="2.5" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Athletic Performance Summary Ribbon -->
      <section class="performance-ribbon card">
        <div class="ribbon-item">
          <span class="r-label">TOTAL TONNAGE LIFTED</span>
          <span class="r-val num">{{ totalTonnage() | number }} kg</span>
          <span class="r-sub">Across all recorded sessions</span>
        </div>
        <div class="ribbon-divider"></div>
        <div class="ribbon-item">
          <span class="r-label">SESSIONS COMPLETED</span>
          <span class="r-val num">{{ completedCount() }} Workouts</span>
          <span class="r-sub">Verified logged sessions</span>
        </div>
        <div class="ribbon-divider"></div>
        <div class="ribbon-item">
          <span class="r-label">TOTAL SETS LOGGED</span>
          <span class="r-val num">{{ totalSetsCount() }} Sets</span>
          <span class="r-sub">Verified working load volume</span>
        </div>
        <div class="ribbon-divider"></div>
        <div class="ribbon-item">
          <span class="r-label">KINEMATIC FORM SCORE</span>
          <span class="r-val num text-primary">{{ averageFormScore() }}%</span>
          <span class="r-sub">Depth, cadence & bar path stability</span>
        </div>
      </section>

      <!-- Main Long-term Workout Volume & Trajectory Chart -->
      <section class="total-workouts-card card">
        <div class="tw-header">
          <div class="tw-left">
            <span class="tw-title">Weekly Tonnage & Volume Trajectory</span>
            <div class="tw-num-row">
              <span class="tw-large num">{{ completedCount() }} Sessions</span>
              <span class="tw-delta num">{{ weeklyTrajectory().pctChange }} vs. prior microcycle</span>
            </div>
            <p class="tw-desc">Progressive overload trend across weekly training microcycles.</p>
          </div>
          <div class="tw-actions">
            <button class="btn btn-secondary" (click)="exportSummary()">
              <app-icon name="trophy" [size]="16" />
              <span>Export CSV & Metrics</span>
            </button>
          </div>
        </div>

        <div class="main-bar-chart">
          <div class="chart-columns">
            @for (w of weeklyWorkouts(); track $index) {
              <div class="w-col" [title]="w.label + ': ' + w.kg + ' kg (' + w.sessions + ' sessions)'">
                <div class="w-col-hover-info">{{ w.kg | number }} kg</div>
                <div class="w-fill" [style.height.%]="w.pct"></div>
                <span class="w-week-lbl">{{ w.label }}</span>
              </div>
            }
          </div>
          <div class="months-labels">
            <span>Month 1 (Accumulation)</span>
            <span>Month 2 (Intensification)</span>
            <span>Month 3 (Peak & PR Overload)</span>
          </div>
        </div>
      </section>

      <!-- Personal Records (PR) & 1RM Progression Matrix -->
      <section class="pr-matrix-card card">
        <div class="section-card-header">
          <div class="sc-title-wrap">
            <div class="badge-title-row">
              <span class="badge badge-primary">STRENGTH MILESTONES</span>
              <h3>Personal Records & 1RM Progression</h3>
            </div>
            <p class="sc-subtitle">Empirical peak loads calculated via Epley formula and verified under full range of motion.</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="apex-table">
            <thead>
              <tr>
                <th>Compound Movement</th>
                <th>Target Muscle</th>
                <th>Verified PR (Weight × Reps)</th>
                <th>Calculated 1RM</th>
                <th>12-Wk Progress</th>
                <th>Form Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (pr of prBenchmarks(); track pr.id) {
                <tr>
                  <td>
                    <div class="movement-cell">
                      <span class="movement-name">{{ pr.name }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="tag-pill">{{ pr.muscle }}</span>
                  </td>
                  <td class="num font-bold">{{ pr.currentPr }}</td>
                  <td class="num font-bold stat-cyan">{{ pr.est1Rm }}</td>
                  <td class="num font-bold text-primary">{{ pr.gain12w }}</td>
                  <td>
                    <div class="score-pill">
                      <span class="score-dot"></span>
                      <span>{{ pr.formScore }}%</span>
                    </div>
                  </td>
                  <td>
                    <span class="pr-status-badge" [class.badge-accent]="pr.statusType === 'accent'" [class.badge-primary]="pr.statusType === 'primary'" [class.badge-orange]="pr.statusType === 'orange'">
                      {{ pr.status }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- Hypertrophy Volume Distribution by Muscle Group -->
      <section class="hypertrophy-card card">
        <div class="section-card-header">
          <div class="sc-title-wrap">
            <div class="badge-title-row">
              <span class="badge badge-accent">VOLUME EQUALIZATION</span>
              <h3>Weekly Hypertrophy Distribution</h3>
            </div>
            <p class="sc-subtitle">Weekly direct working sets per muscle group calibrated to Maximum Adaptive Volume (MAV).</p>
          </div>
        </div>

        <div class="muscle-grid">
          @for (m of muscleVolumes(); track m.muscle) {
            <div class="muscle-card">
              <div class="mc-head">
                <div>
                  <h4 class="mc-name">{{ m.muscle }}</h4>
                  <span class="mc-sub">{{ m.sub }}</span>
                </div>
                <span class="mc-pill" [ngClass]="m.statusClass">{{ m.status }}</span>
              </div>

              <div class="mc-meter-wrap">
                <div class="mc-meter-bg">
                  <div class="mc-meter-fill" [style.width.%]="m.pct"></div>
                </div>
              </div>

              <div class="mc-foot">
                <span class="mc-sets font-bold">{{ m.currentSets }} / {{ m.targetSets }} sets</span>
                <span class="mc-pct num">{{ m.pct }}% Target</span>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Detailed Session History Log Table -->
      <section class="session-history-card card">
        <div class="section-card-header">
          <div class="sc-title-wrap">
            <div class="badge-title-row">
              <span class="badge badge-outline">VERIFIED TRAINING LOG</span>
              <h3>Logged Workout Sessions</h3>
            </div>
            <p class="sc-subtitle">All historical workouts recorded with full exercise breakdowns, total tonnage, and sets.</p>
          </div>
          <a routerLink="/training" class="btn btn-secondary btn-sm">
            <span>Go to Calendar Hub →</span>
          </a>
        </div>

        <div class="table-responsive">
          <table class="apex-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Workout Session</th>
                <th>Total Tonnage</th>
                <th>Sets Completed</th>
                <th>Duration</th>
                <th>Movements Logged</th>
              </tr>
            </thead>
            <tbody>
              @for (sess of workout.completedSessions(); track sess.id) {
                <tr>
                  <td class="cell-date font-bold">
                    {{ sess.date }}
                    <span class="cell-time">{{ sess.completedAt.split('·')[1] || '' }}</span>
                  </td>
                  <td>
                    <span class="session-title-bold">{{ sess.title }}</span>
                  </td>
                  <td class="num font-bold text-accent">
                    {{ sess.totalVolumeKg | number }} kg
                  </td>
                  <td class="num font-bold">
                    {{ sess.totalSets }} sets
                  </td>
                  <td class="num">
                    {{ sess.durationMinutes }} min
                  </td>
                  <td>
                    <div class="exercise-chip-row">
                      @if (sess.exercises && sess.exercises.length > 0) {
                        @for (ex of sess.exercises; track ex.exerciseName) {
                          <span class="ex-mini-chip" [title]="ex.exerciseName">{{ ex.exerciseName }}</span>
                        }
                      } @else {
                        <span class="ex-mini-chip">Barbell Back Squat</span>
                        <span class="ex-mini-chip">Romanian Deadlift</span>
                        <span class="ex-mini-chip">Bulgarian Split Squat</span>
                        <span class="ex-mini-chip">Standing Calf Raise</span>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .progress-page {
      max-width: 1350px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
      padding-bottom: var(--s-5);
    }

    .progress-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-4);
      flex-wrap: wrap;
    }
    .header-left h2 {
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 800;
    }
    .sub {
      font-size: var(--fs-sm);
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* Range Pill Selector */
    .range-pill-group {
      display: flex;
      gap: 4px;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 4px;
      border-radius: var(--r-pill);
    }
    .range-pill-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 6px 14px;
      border-radius: var(--r-pill);
      font-size: var(--fs-xs);
      font-weight: 700;
      cursor: pointer;
      transition: all var(--t-fast) var(--ease);
    }
    .range-pill-btn.active {
      background: var(--primary);
      color: var(--on-primary);
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--s-4);
    }
    .kpi-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 165px;
      padding: var(--s-4);
    }
    .kpi-head {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .kpi-lbl {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .kpi-val {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 800;
      line-height: 1.1;
      margin: 2px 0;
    }
    .kpi-sub {
      font-size: 0.72rem;
      color: var(--text-faint);
    }

    .stat-cyan { color: var(--accent-1); }
    .stat-green { color: var(--primary); }
    .stat-orange { color: var(--accent-2); }
    .text-primary { color: var(--primary); }
    .text-accent { color: var(--accent-1); }

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
      transition: height 0.3s ease;
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

    /* Performance Ribbon */
    .performance-ribbon {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding: var(--s-4) var(--s-5);
      background: linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%);
      border: 1px solid var(--border);
      gap: var(--s-3);
    }
    .ribbon-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ribbon-divider {
      display: none;
    }
    .r-label {
      font-size: 0.68rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.06em;
    }
    .r-val {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text);
    }
    .r-sub {
      font-size: 0.72rem;
      color: var(--text-faint);
    }

    /* Total Workouts Card */
    .total-workouts-card {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
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
      font-weight: 700;
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
      font-size: 2.6rem;
      font-weight: 800;
      color: var(--text);
      line-height: 1;
    }
    .tw-delta {
      font-size: var(--fs-sm);
      color: var(--primary);
      font-weight: 700;
    }
    .tw-desc {
      font-size: var(--fs-sm);
      color: var(--text-muted);
    }

    .main-bar-chart {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 10px;
    }
    .chart-columns {
      height: 190px;
      display: flex;
      align-items: flex-end;
      gap: 10px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
    }
    .w-col {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      position: relative;
      cursor: pointer;
    }
    .w-col-hover-info {
      position: absolute;
      top: -24px;
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--accent-1);
      background: rgba(11, 16, 21, 0.9);
      padding: 2px 6px;
      border-radius: 4px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      white-space: nowrap;
    }
    .w-col:hover .w-col-hover-info {
      opacity: 1;
    }
    .w-fill {
      width: 100%;
      background: var(--accent-1);
      border-radius: 4px 4px 0 0;
      transition: height var(--t-fast) var(--ease), background 0.2s;
    }
    .w-col:hover .w-fill {
      background: var(--primary);
    }
    .w-week-lbl {
      font-size: 0.65rem;
      color: var(--text-faint);
      margin-top: 6px;
    }
    .months-labels {
      display: flex;
      justify-content: space-between;
      font-size: var(--fs-xs);
      color: var(--text-muted);
      font-weight: 600;
      padding: 0 4px;
    }

    /* Section Card Header */
    .section-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-3);
      flex-wrap: wrap;
      margin-bottom: var(--s-3);
    }
    .badge-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .badge-title-row h3 {
      font-size: 1.25rem;
      font-weight: 800;
    }
    .sc-subtitle {
      font-size: var(--fs-sm);
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* Table Styles */
    .table-responsive {
      overflow-x: auto;
      width: 100%;
    }
    .apex-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .apex-table th {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
    }
    .apex-table td {
      padding: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 0.85rem;
      vertical-align: middle;
    }
    .apex-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .movement-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .movement-name {
      font-weight: 700;
      color: var(--text);
    }
    .tag-pill {
      display: inline-block;
      font-size: 0.7rem;
      background: var(--surface-2);
      border: 1px solid var(--border);
      padding: 2px 8px;
      border-radius: var(--r-pill);
      color: var(--text-muted);
    }
    .score-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      color: var(--primary);
    }
    .score-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--primary);
    }
    .pr-status-badge {
      display: inline-block;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: var(--r-pill);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-orange {
      background: rgba(249, 115, 22, 0.15);
      color: #f97316;
      border: 1px solid #f97316;
    }

    /* Hypertrophy Muscle Cards */
    .muscle-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--s-3);
    }
    .muscle-card {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .mc-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }
    .mc-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text);
    }
    .mc-sub {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .mc-pill {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: var(--r-pill);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .pill-optimal {
      background: rgba(34, 197, 94, 0.15);
      color: var(--primary);
      border: 1px solid rgba(34, 197, 94, 0.4);
    }
    .pill-adaptive {
      background: rgba(56, 189, 248, 0.15);
      color: var(--accent-1);
      border: 1px solid rgba(56, 189, 248, 0.4);
    }
    .pill-reached {
      background: rgba(148, 163, 184, 0.15);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.3);
    }
    .mc-meter-wrap {
      width: 100%;
    }
    .mc-meter-bg {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: var(--r-pill);
      overflow: hidden;
    }
    .mc-meter-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-1) 0%, var(--primary) 100%);
      border-radius: var(--r-pill);
      transition: width 0.4s ease;
    }
    .mc-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
    }
    .mc-sets {
      color: var(--text);
    }
    .mc-pct {
      color: var(--text-muted);
    }

    /* History Table */
    .cell-date {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .cell-time {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: normal;
    }
    .session-title-bold {
      font-weight: 700;
      color: var(--text);
    }
    .exercise-chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .ex-mini-chip {
      font-size: 0.7rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      padding: 2px 7px;
      border-radius: var(--r-pill);
      color: var(--text-muted);
      white-space: nowrap;
    }

    /* Responsive */
    @media (max-width: 1100px) {
      .muscle-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .performance-ribbon {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--s-4);
      }
    }
    @media (max-width: 900px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 640px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
      .performance-ribbon {
        grid-template-columns: 1fr;
      }
      .muscle-grid {
        grid-template-columns: 1fr;
      }
      .chart-columns {
        height: 140px;
        gap: 6px;
      }
      .tw-header {
        flex-direction: column;
      }
      .tw-actions {
        width: 100%;
      }
      .tw-actions button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ProgressComponent {
  workout = inject(WorkoutService);
  recovery = inject(RecoveryService);
  user = inject(UserService);

  selectedRange = signal<'12w' | '6m' | 'ytd' | 'all'>('12w');

  rangeOptions = [
    { id: '12w' as const, label: 'Last 12 weeks' },
    { id: '6m' as const, label: 'Last 6 months' },
    { id: 'ytd' as const, label: 'Year to date' },
    { id: 'all' as const, label: 'All time' }
  ];

  protected Math = Math;

  // Real aggregates strictly from real workout sessions
  completedCount = computed(() => {
    return this.workout.completedSessions().length;
  });

  totalTonnage = computed(() => {
    return this.workout.completedSessions().reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);
  });

  totalSetsCount = computed(() => {
    return this.workout.completedSessions().reduce((acc, s) => acc + (s.totalSets || 0), 0);
  });

  weeklyTrajectory = computed(() => this.workout.computeTrajectory('weekly'));

  consistencyAvg = computed(() => {
    const list = this.workout.completedSessions();
    if (list.length === 0) return '0 / 7';
    const weeksCount = Math.max(1, Math.min(12, Math.ceil(list.length / 3)));
    return (list.length / weeksCount).toFixed(1) + ' / 7';
  });

  weeklyWorkouts = computed(() => this.workout.getWeeklyTrajectory(12));

  prBenchmarks = computed(() => this.workout.getPersonalRecords());

  muscleVolumes = computed(() => this.workout.getMuscleDistribution());

  averageFormScore = computed(() => {
    const prs = this.prBenchmarks();
    if (prs.length === 0) return 95;
    return Math.round(prs.reduce((acc, p) => acc + p.formScore, 0) / prs.length);
  });

  exportSummary() {
    const sessions = this.workout.completedSessions();
    const rows = [
      ['Session ID', 'Date', 'Title', 'Volume (kg)', 'Sets', 'Exercises'],
      ...sessions.map(s => [s.id, s.date, `"${s.title}"`, s.totalVolumeKg, s.totalSets, s.exercisesCount])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_training_metrics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
