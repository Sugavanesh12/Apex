import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { ProgressRingComponent } from '../../shared/ui/progress-ring/progress-ring.component';
import { MacroBarComponent } from '../../shared/ui/macro-bar/macro-bar.component';
import { UserService } from '../../core/services/user.service';
import { WorkoutService } from '../../core/services/workout.service';
import { NutritionService } from '../../core/services/nutrition.service';
import { RecoveryService } from '../../core/services/recovery.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [RouterLink, DecimalPipe, IconComponent, ProgressRingComponent, MacroBarComponent],
  template: `
    <div class="overview-page">
      <!-- Greeting Header -->
      <section class="greeting-header">
        <div class="greeting-text">
          <h1>Good morning, {{ user.profile().name }}.</h1>
          <p class="greeting-sub">Same commitment. A brighter you.</p>
        </div>
        <div class="greeting-meta">
          <div class="date-chip">
            <span>Tue, Apr 14, 2026</span>
            <span class="meta-dot">·</span>
            <app-icon name="sun" [size]="14" color="var(--warning)" />
            <span>16°C</span>
          </div>
          <div class="motto">"Progress lives in the choices you make today."</div>
        </div>
      </section>

      <!-- AI BRIEFING HERO CARD (From Reference Screen) -->
      <section class="hero-card">
        <div class="hero-left">
          <div class="badge-row">
            <span class="pulse-dot"></span>
            <span class="briefing-tag">AI BRIEFING</span>
          </div>
          <h2>You’re on track.</h2>
          <p class="hero-body">
            Your readiness is high, sleep looks solid, and you’re building great momentum. Today’s session supports your strength focus while keeping recovery on track.
          </p>
        </div>

        <div class="hero-visual">
          <div class="athlete-art">
            <img src="/img/hero-mountain.jpg" alt="Mountain summit athlete" class="art-img" />
          </div>

          <div class="readiness-block">
            <app-progress-ring
              [value]="user.profile().readiness"
              [size]="104"
              [strokeWidth]="8"
              strokeColor="var(--primary)"
              trackColor="var(--surface-3)"
              label="Readiness Score"
            >
              <span class="ring-score num">{{ user.profile().readiness }}</span>
              <span class="ring-label">Readiness</span>
            </app-progress-ring>

            <div class="factor-legend">
              <div class="factor-row">
                <span class="f-dot" style="background: var(--accent-1)"></span>
                <span class="f-name">Sleep</span>
                <span class="f-val num">{{ user.profile().readinessFactors.sleep }}</span>
              </div>
              <div class="factor-row">
                <span class="f-dot" style="background: var(--accent-1)"></span>
                <span class="f-name">HRV</span>
                <span class="f-val num">{{ user.profile().readinessFactors.hrv }}</span>
              </div>
              <div class="factor-row">
                <span class="f-dot" style="background: var(--primary)"></span>
                <span class="f-name">Load</span>
                <span class="f-val num">{{ user.profile().readinessFactors.load }}</span>
              </div>
              <div class="factor-row">
                <span class="f-dot" style="background: var(--accent-3)"></span>
                <span class="f-name">Mood</span>
                <span class="f-val num">{{ user.profile().readinessFactors.mood }}</span>
              </div>
              <a routerLink="/recovery" class="view-details-link">
                View details →
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 4-CARD DASHBOARD GRID -->
      <section class="metrics-grid">
        <!-- 1. TODAY'S MISSION -->
        <div class="card mission-card">
          <div class="card-top">
            <div class="card-icon-title">
              <app-icon name="train" [size]="18" color="var(--accent-1)" />
              <span class="card-category">TODAY'S MISSION</span>
            </div>
          </div>

          <div class="mission-details">
            <h3 class="mission-title">Lower Body Strength</h3>
            <p class="mission-meta">Build strength · 45 min · Gym</p>
          </div>

          <ul class="mission-checklist">
            <li>
              <span class="check-circle done">✓</span>
              <span>Dynamic warm-up</span>
            </li>
            <li>
              <span class="check-circle"></span>
              <span>Strength block</span>
            </li>
            <li>
              <span class="check-circle"></span>
              <span>Accessory work</span>
            </li>
            <li>
              <span class="check-circle"></span>
              <span>Cooldown</span>
            </li>
          </ul>

          <div class="card-cta">
            <a routerLink="/training/session/live" class="btn btn-primary start-session-btn">
              <app-icon name="play" [size]="14" />
              <span>Start Session</span>
            </a>
          </div>
        </div>

        <!-- 2. FUEL -->
        <div class="card fuel-card">
          <div class="card-top">
            <div class="card-icon-title">
              <app-icon name="fuel" [size]="18" color="var(--primary)" />
              <span class="card-category">FUEL</span>
            </div>
          </div>

          <div class="card-heading-block">
            <h3 class="card-headline">Hit your fuel targets</h3>
          </div>

          <div class="ring-center-block">
            <app-progress-ring
              [value]="nutrition.caloriesConsumed()"
              [max]="nutrition.caloriesTarget()"
              [size]="120"
              [strokeWidth]="8"
              strokeColor="var(--primary)"
              label="Calories Target"
            >
              <span class="fuel-ring-val num">{{ nutrition.caloriesConsumed() | number }}</span>
              <span class="fuel-ring-sub">of {{ nutrition.caloriesTarget() | number }} kcal</span>
            </app-progress-ring>
          </div>

          <div class="macro-bars-list">
            <app-macro-bar
              label="Protein"
              [current]="nutrition.proteinConsumed()"
              [target]="nutrition.proteinTarget()"
              color="var(--macro-protein)"
            />
            <app-macro-bar
              label="Carbs"
              [current]="nutrition.carbsConsumed()"
              [target]="nutrition.carbsTarget()"
              color="var(--macro-carbs)"
            />
            <app-macro-bar
              label="Fats"
              [current]="nutrition.fatConsumed()"
              [target]="nutrition.fatTarget()"
              color="var(--macro-fat)"
            />
          </div>

          <div class="card-cta">
            <a routerLink="/nutrition/scan" class="btn btn-secondary w-full">
              Log a Meal
            </a>
          </div>
        </div>

        <!-- 3. RECOVERY -->
        <div class="card recovery-card">
          <div class="card-top">
            <div class="card-icon-title">
              <app-icon name="recover" [size]="18" color="var(--accent-1)" />
              <span class="card-category">RECOVERY</span>
            </div>
          </div>

          <div class="card-heading-block">
            <h3 class="card-headline">Keep the momentum</h3>
          </div>

          <div class="ring-center-block">
            <app-progress-ring
              [value]="88"
              [size]="120"
              [strokeWidth]="8"
              strokeColor="var(--accent-1)"
              label="Sleep Recovery"
            >
              <span class="fuel-ring-val">{{ recovery.sleepTime() }}</span>
              <span class="fuel-ring-sub">Sleep</span>
            </app-progress-ring>
          </div>

          <div class="stats-list">
            <div class="stat-line">
              <span class="stat-lbl"><app-icon name="sleep" [size]="14" /> Sleep</span>
              <span class="stat-num num">{{ recovery.sleepTime() }}</span>
            </div>
            <div class="stat-line">
              <span class="stat-lbl"><app-icon name="zap" [size]="14" /> HRV</span>
              <span class="stat-num num">{{ recovery.hrv() }}</span>
            </div>
            <div class="stat-line">
              <span class="stat-lbl"><app-icon name="heart" [size]="14" /> Resting HR</span>
              <span class="stat-num num">{{ recovery.restingHr() }}</span>
            </div>
            <div class="stat-line">
              <span class="stat-lbl"><app-icon name="sun" [size]="14" /> Mood</span>
              <span class="stat-num">{{ recovery.mood() }}</span>
            </div>
          </div>

          <div class="card-cta">
            <a routerLink="/recovery/checkin" class="btn btn-secondary w-full">
              Log Recovery
            </a>
          </div>
        </div>

        <!-- 4. PROGRESS -->
        <div class="card progress-card">
          <div class="card-top">
            <div class="card-icon-title">
              <app-icon name="progress" [size]="18" color="var(--accent-1)" />
              <span class="card-category">PROGRESS</span>
            </div>
          </div>

          <div class="card-heading-block">
            <h3 class="card-headline">Consistent and climbing</h3>
          </div>

          <div class="mini-chart">
            <div class="bars-container">
              <div class="bar-col"><div class="bar-fill" style="height: 45%;"></div><span>M</span></div>
              <div class="bar-col"><div class="bar-fill" style="height: 65%;"></div><span>T</span></div>
              <div class="bar-col"><div class="bar-fill" style="height: 85%;"></div><span>W</span></div>
              <div class="bar-col"><div class="bar-fill" style="height: 60%;"></div><span>T</span></div>
              <div class="bar-col"><div class="bar-fill current" style="height: 95%;"></div><span>F</span></div>
              <div class="bar-col"><div class="bar-fill" style="height: 30%;"></div><span>S</span></div>
              <div class="bar-col"><div class="bar-fill" style="height: 50%;"></div><span>S</span></div>
            </div>
          </div>

          <div class="stats-list">
            <div class="stat-line">
              <span class="stat-lbl"><app-icon name="flame" [size]="14" /> Training Load</span>
              <span class="stat-num stat-up num">↑ 12%</span>
            </div>
            <div class="stat-line">
              <span class="stat-lbl"><app-icon name="barbell" [size]="14" /> Strength</span>
              <span class="stat-num stat-up num">↑ 8%</span>
            </div>
            <div class="stat-line">
              <span class="stat-lbl"><app-icon name="check" [size]="14" /> Consistency</span>
              <span class="stat-num num">5 / 7</span>
            </div>
          </div>

          <div class="card-cta">
            <a routerLink="/progress" class="btn btn-secondary w-full">
              View Progress
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .overview-page {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
    }

    /* Greeting Header */
    .greeting-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--s-4);
      flex-wrap: wrap;
    }
    .greeting-text h1 {
      font-size: clamp(1.6rem, 2.8vw, 2.2rem);
    }
    .greeting-sub {
      font-size: var(--fs-sm);
      color: var(--text-muted);
      margin-top: 2px;
    }
    .greeting-meta {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .date-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--fs-xs);
      color: var(--text-muted);
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 4px 10px;
      border-radius: var(--r-pill);
    }
    .meta-dot {
      color: var(--text-faint);
    }
    .motto {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-style: italic;
    }

    /* Hero AI Briefing Card */
    .hero-card {
      background: linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%);
      border: 1px solid var(--border);
      border-radius: var(--r-card);
      padding: var(--s-5) var(--s-6);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-5);
      position: relative;
      overflow: hidden;
    }
    .hero-left {
      max-width: 460px;
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
      z-index: 2;
    }
    .badge-row {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 8px var(--primary);
    }
    .briefing-tag {
      font-size: var(--fs-xs);
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--primary);
    }
    .hero-left h2 {
      font-size: clamp(1.5rem, 2.5vw, 2.1rem);
    }
    .hero-body {
      font-size: var(--fs-sm);
      line-height: 1.55;
      color: var(--text-muted);
    }

    .hero-visual {
      display: flex;
      align-items: center;
      gap: var(--s-5);
      z-index: 2;
    }
    .athlete-art {
      width: 140px;
      height: 110px;
      border-radius: var(--r-card);
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .art-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: contrast(1.1) brightness(0.9);
    }

    .readiness-block {
      display: flex;
      align-items: center;
      gap: var(--s-4);
    }
    .ring-score {
      font-family: var(--font-display);
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text);
      line-height: 1;
    }
    .ring-label {
      font-size: 0.65rem;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .factor-legend {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 90px;
    }
    .factor-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--fs-xs);
    }
    .f-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .f-name {
      color: var(--text-muted);
      flex: 1;
    }
    .f-val {
      color: var(--text);
      font-weight: 600;
    }
    .view-details-link {
      font-size: var(--fs-xs);
      color: var(--primary);
      text-decoration: none;
      margin-top: 4px;
      font-weight: 600;
    }
    .view-details-link:hover {
      text-decoration: underline;
    }

    /* 4-Card Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--s-4);
    }
    .card {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-icon-title {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .card-category {
      font-size: var(--fs-xs);
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .card-heading-block {
      margin-top: -4px;
    }
    .card-headline {
      font-size: var(--fs-md);
      font-weight: 600;
      color: var(--text);
    }

    /* Mission Card */
    .mission-title {
      font-size: 1.15rem;
      margin-bottom: 2px;
    }
    .mission-meta {
      font-size: var(--fs-xs);
      color: var(--text-muted);
    }
    .mission-checklist {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: var(--s-2) 0;
    }
    .mission-checklist li {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: var(--fs-xs);
      color: var(--text-muted);
    }
    .check-circle {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid var(--border-strong);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      color: transparent;
    }
    .check-circle.done {
      background: var(--primary-soft);
      border-color: var(--primary);
      color: var(--primary);
    }

    .start-session-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .w-full {
      width: 100%;
      text-align: center;
      display: block;
    }

    /* Center Ring Block */
    .ring-center-block {
      display: flex;
      justify-content: center;
      padding: var(--s-1) 0;
    }
    .fuel-ring-val {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text);
      line-height: 1.1;
    }
    .fuel-ring-sub {
      font-size: 0.65rem;
      color: var(--text-muted);
    }

    .macro-bars-list, .stats-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .stat-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: var(--fs-xs);
    }
    .stat-lbl {
      color: var(--text-muted);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .stat-num {
      color: var(--text);
      font-weight: 600;
    }
    .stat-up {
      color: var(--primary);
    }

    /* Mini bar chart */
    .mini-chart {
      height: 90px;
      display: flex;
      align-items: flex-end;
      padding: var(--s-2) 0;
    }
    .bars-container {
      width: 100%;
      height: 70px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 4px;
    }
    .bar-col {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
    }
    .bar-col span {
      font-size: 0.65rem;
      color: var(--text-faint);
    }
    .bar-fill {
      width: 100%;
      background: var(--surface-3);
      border-radius: 4px 4px 0 0;
      transition: height var(--t-med) var(--ease);
    }
    .bar-fill.current {
      background: var(--accent-1);
    }

    .card-cta {
      margin-top: auto;
      padding-top: var(--s-2);
    }

    @media (max-width: 1200px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 800px) {
      .hero-card {
        flex-direction: column;
        align-items: flex-start;
      }
      .hero-visual {
        width: 100%;
        justify-content: space-between;
      }
    }
    @media (max-width: 600px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
      .athlete-art {
        display: none;
      }
    }
  `]
})
export class OverviewComponent {
  user = inject(UserService);
  workout = inject(WorkoutService);
  nutrition = inject(NutritionService);
  recovery = inject(RecoveryService);
}
