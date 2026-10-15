import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { MoodLevel, RecoveryService } from '../../core/services/recovery.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-recovery-checkin',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="checkin-page">
      <!-- Header -->
      <header class="checkin-header">
        <a routerLink="/recovery" class="back-link">
          <app-icon name="chevron-left" [size]="20" />
          <span>Recovery Check-in</span>
        </a>
        <h2>How do you feel today?</h2>
      </header>

      <!-- Mood Selection Row (From Reference Mockup) -->
      <div class="mood-selector card">
        @for (m of moodOptions; track m.label) {
          <button
            class="mood-btn"
            [class.selected]="recovery.checkin().mood === m.label"
            (click)="selectMood(m.label)"
          >
            <span class="mood-face">{{ m.emoji }}</span>
            <span class="mood-lbl">{{ m.label }}</span>
          </button>
        }
      </div>

      <!-- Signals 2x2 Grid (From Reference Mockup) -->
      <div class="signals-grid">
        <!-- Sleep Card -->
        <div class="signal-card card">
          <div class="signal-head">
            <span class="sig-title">Sleep</span>
            <span class="sig-val num">{{ recovery.checkin().sleepHours }}h 24m</span>
          </div>
          <!-- Mini Sleep Bar Chart from Mockup -->
          <div class="signal-bars">
            <div class="sig-bar" style="height: 60%"></div>
            <div class="sig-bar" style="height: 80%"></div>
            <div class="sig-bar" style="height: 95%"></div>
            <div class="sig-bar" style="height: 50%"></div>
            <div class="sig-bar" style="height: 75%"></div>
          </div>
          <div class="slider-stepper">
            <button class="step-btn" (click)="adjustSleep(-0.5)">-</button>
            <span class="step-note">Adjust Hours</span>
            <button class="step-btn" (click)="adjustSleep(0.5)">+</button>
          </div>
        </div>

        <!-- Stress Card -->
        <div class="signal-card card">
          <div class="signal-head">
            <span class="sig-title">Stress</span>
            <span class="sig-val stress-low">Low</span>
          </div>
          <div class="wave-graphic">
            <svg viewBox="0 0 120 30" class="wave-svg">
              <path d="M0,15 Q30,5 60,15 T120,15" fill="none" stroke="var(--accent-1)" stroke-width="2.5" />
            </svg>
          </div>
          <div class="slider-stepper">
            <button class="step-btn" (click)="adjustStress(-1)">-</button>
            <span class="step-note">Stress Level: {{ recovery.checkin().stressLevel }}/10</span>
            <button class="step-btn" (click)="adjustStress(1)">+</button>
          </div>
        </div>

        <!-- Muscle Soreness Card -->
        <div class="signal-card card">
          <div class="signal-head">
            <span class="sig-title">Muscle Soreness</span>
            <span class="sig-val soreness-mild">Slight</span>
          </div>
          <div class="signal-bars">
            <div class="sig-bar active" style="height: 40%"></div>
            <div class="sig-bar active" style="height: 55%"></div>
            <div class="sig-bar" style="height: 30%"></div>
            <div class="sig-bar" style="height: 20%"></div>
          </div>
          <div class="slider-stepper">
            <button class="step-btn" (click)="adjustSoreness(-1)">-</button>
            <span class="step-note">Soreness: {{ recovery.checkin().sorenessLevel }}/10</span>
            <button class="step-btn" (click)="adjustSoreness(1)">+</button>
          </div>
        </div>

        <!-- Energy Level Card -->
        <div class="signal-card card">
          <div class="signal-head">
            <span class="sig-title">Energy</span>
            <span class="sig-val energy-good">Good</span>
          </div>
          <div class="stepped-energy-bars">
            <div class="e-bar active"></div>
            <div class="e-bar active"></div>
            <div class="e-bar active"></div>
            <div class="e-bar active"></div>
            <div class="e-bar"></div>
          </div>
          <div class="slider-stepper">
            <button class="step-btn" (click)="adjustEnergy(-1)">-</button>
            <span class="step-note">Energy Level: {{ recovery.checkin().energyLevel }}/10</span>
            <button class="step-btn" (click)="adjustEnergy(1)">+</button>
          </div>
        </div>
      </div>

      <!-- Live Calculated Readiness Preview (via domain/readiness.ts) -->
      <div class="calculated-preview card">
        <div class="preview-score-box">
          <span class="preview-score num">{{ recovery.readinessResult().score }}</span>
          <span class="preview-label">Calculated Readiness</span>
        </div>
        <div class="preview-text">
          <span class="badge badge-primary">{{ recovery.readinessResult().recommendation }}</span>
          <p class="preview-reason">{{ recovery.readinessResult().reason }}</p>
        </div>
      </div>

      <!-- Save Check-in Button (From Reference Mockup) -->
      <div class="checkin-cta">
        <button class="btn btn-primary save-btn" (click)="saveCheckin()">
          Save Check-in
        </button>
      </div>
    </div>
  `,
  styles: [`
    .checkin-page {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
    }
    .checkin-header {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
      font-size: var(--fs-xs);
      text-decoration: none;
      font-weight: 600;
    }
    .checkin-header h2 {
      font-size: clamp(1.4rem, 2.5vw, 1.8rem);
    }

    /* Mood Selector (From Mockup) */
    .mood-selector {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      padding: var(--s-3);
    }
    .mood-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 6px;
      border-radius: var(--r-input);
      border: 1px solid var(--border);
      background: var(--surface-2);
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--t-fast) var(--ease);
    }
    .mood-btn:hover {
      border-color: var(--border-strong);
      background: var(--surface-3);
    }
    .mood-btn.selected {
      background: var(--primary-soft);
      border-color: var(--primary);
      color: var(--text);
    }
    .mood-face {
      font-size: 1.5rem;
    }
    .mood-lbl {
      font-size: var(--fs-xs);
      font-weight: 600;
    }

    /* Signals Grid */
    .signals-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-4);
    }
    .signal-card {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      padding: var(--s-4);
    }
    .signal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sig-title {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      font-weight: 600;
    }
    .sig-val {
      font-size: var(--fs-sm);
      font-weight: 700;
      color: var(--text);
    }
    .stress-low {
      color: var(--accent-1);
    }
    .soreness-mild {
      color: var(--accent-2);
    }
    .energy-good {
      color: var(--primary);
    }

    .signal-bars {
      height: 48px;
      display: flex;
      align-items: flex-end;
      gap: 6px;
    }
    .sig-bar {
      flex: 1;
      background: var(--surface-3);
      border-radius: 3px 3px 0 0;
    }
    .sig-bar.active {
      background: var(--accent-2);
    }

    .wave-graphic {
      height: 48px;
      display: flex;
      align-items: center;
    }
    .wave-svg {
      width: 100%;
      height: 30px;
    }

    .stepped-energy-bars {
      height: 48px;
      display: flex;
      align-items: flex-end;
      gap: 6px;
    }
    .e-bar {
      flex: 1;
      height: 24px;
      background: var(--surface-3);
      border-radius: 3px;
    }
    .e-bar.active {
      background: var(--primary);
      height: 36px;
    }

    .slider-stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      padding-top: 8px;
      margin-top: auto;
    }
    .step-btn {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      font-weight: 700;
    }
    .step-btn:hover {
      color: var(--text);
      border-color: var(--border-strong);
    }
    .step-note {
      font-size: 0.7rem;
      color: var(--text-faint);
    }

    /* Calculated Preview */
    .calculated-preview {
      display: flex;
      align-items: center;
      gap: var(--s-4);
      padding: var(--s-3) var(--s-4);
      background: var(--surface-2);
      border: 1px solid var(--primary-line);
    }
    .preview-score-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
    }
    .preview-score {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 800;
      color: var(--primary);
      line-height: 1;
    }
    .preview-label {
      font-size: 0.6rem;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-top: 2px;
    }
    .preview-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .preview-reason {
      font-size: var(--fs-xs);
      color: var(--text);
    }

    .save-btn {
      width: 100%;
      padding: 14px;
      font-size: var(--fs-md);
      font-weight: 700;
    }

    @media (max-width: 600px) {
      .signals-grid {
        grid-template-columns: 1fr;
      }
      .mood-selector {
        grid-template-columns: repeat(5, 1fr);
      }
    }
  `]
})
export class RecoveryCheckinComponent {
  recovery = inject(RecoveryService);
  user = inject(UserService);
  router = inject(Router);

  moodOptions: { label: MoodLevel; emoji: string }[] = [
    { label: 'Terrible', emoji: '😣' },
    { label: 'Tired', emoji: '🥱' },
    { label: 'Okay', emoji: '😐' },
    { label: 'Good', emoji: '🙂' },
    { label: 'Great', emoji: '😄' }
  ];

  selectMood(m: MoodLevel) {
    this.recovery.updateCheckin({ mood: m });
  }

  adjustSleep(delta: number) {
    const cur = this.recovery.checkin().sleepHours;
    this.recovery.updateCheckin({ sleepHours: Math.max(3, Math.min(12, +(cur + delta).toFixed(1))) });
  }

  adjustStress(delta: number) {
    const cur = this.recovery.checkin().stressLevel;
    this.recovery.updateCheckin({ stressLevel: Math.max(1, Math.min(10, cur + delta)) });
  }

  adjustSoreness(delta: number) {
    const cur = this.recovery.checkin().sorenessLevel;
    this.recovery.updateCheckin({ sorenessLevel: Math.max(0, Math.min(10, cur + delta)) });
  }

  adjustEnergy(delta: number) {
    const cur = this.recovery.checkin().energyLevel;
    this.recovery.updateCheckin({ energyLevel: Math.max(1, Math.min(10, cur + delta)) });
  }

  saveCheckin() {
    const score = this.recovery.readinessResult().score ?? 86;
    this.user.profile.update(p => ({ ...p, readiness: score }));
    alert(`Check-in saved! Your new readiness score is ${score}.`);
    this.router.navigate(['/overview']);
  }
}
