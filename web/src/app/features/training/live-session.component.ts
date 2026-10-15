import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { ProgressRingComponent } from '../../shared/ui/progress-ring/progress-ring.component';
import { WorkoutService } from '../../core/services/workout.service';

@Component({
  selector: 'app-live-session',
  standalone: true,
  imports: [RouterLink, IconComponent, ProgressRingComponent],
  template: `
    <div class="live-session-page">
      <!-- Session Top Bar -->
      <header class="session-topbar">
        <a routerLink="/training" class="back-link">
          <app-icon name="chevron-left" [size]="20" />
          <span class="topbar-title">Live Session</span>
        </a>

        <div class="timer-badge">
          <span class="rec-dot"></span>
          <span class="timer-val num">{{ formattedTime() }}</span>
        </div>

        <button class="btn btn-secondary finish-btn" (click)="finishWorkout()">
          Finish Workout
        </button>
      </header>

      <!-- Main Live Split: Visual on left, Logger on right -->
      <div class="live-grid">
        <!-- Visual & Rep Counter (From Reference Mockup) -->
        <div class="hero-stage card">
          <div class="stage-media">
            <img [src]="workout.currentExercise().exercise.image" alt="Exercise Form" class="stage-img" />
            <div class="stage-overlay">
              <div class="stage-header">
                <div>
                  <h2 class="exercise-name">{{ workout.currentExercise().exercise.name }}</h2>
                  <p class="set-counter">Set 3 of {{ workout.currentExercise().targetSets }}</p>
                </div>
              </div>

              <!-- Big Reps Ring Dial from Reference -->
              <div class="dial-container">
                <app-progress-ring
                  [value]="8"
                  [max]="10"
                  [size]="130"
                  [strokeWidth]="10"
                  strokeColor="var(--accent-2)"
                  trackColor="rgba(255, 255, 255, 0.15)"
                  label="Reps Logged"
                >
                  <span class="dial-reps num">8</span>
                  <span class="dial-label">reps</span>
                </app-progress-ring>

                <div class="dial-meta">
                  <div class="meta-item">
                    <span class="m-lbl">Target</span>
                    <span class="m-val num">8–10 reps</span>
                  </div>
                  <div class="meta-item">
                    <span class="m-lbl">Rest</span>
                    <span class="m-val rest-num num">00:{{ workout.liveSession().restSecondsLeft < 10 ? '0' : '' }}{{ workout.liveSession().restSecondsLeft }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Coaching Tip (From Reference Mockup) -->
          <div class="ai-tip-card">
            <div class="tip-icon">
              <app-icon name="robot" [size]="18" />
            </div>
            <div class="tip-text">
              <div class="tip-title">AI Tip</div>
              <div class="tip-content">Keep your chest up and drive through your heels. Maintain constant core tension.</div>
            </div>
          </div>
        </div>

        <!-- Interactive Set Logger Sheet (Part B of UI doc) -->
        <div class="logger-stage card">
          <div class="logger-header">
            <h3>Set Logger</h3>
            <span class="badge badge-primary">1-Tap Logging</span>
          </div>

          <!-- Table of Sets -->
          <div class="sets-table">
            <div class="table-header">
              <span class="col-set">SET</span>
              <span class="col-kg">KG</span>
              <span class="col-reps">REPS</span>
              <span class="col-rpe">RPE</span>
              <span class="col-action">DONE</span>
            </div>

            @for (set of workout.currentExercise().sets; track set.setNumber; let idx = $index) {
              <div class="set-row" [class.completed]="set.completed" [class.warmup]="set.isWarmup">
                <div class="col-set">
                  @if (set.isWarmup) {
                    <span class="warmup-badge">W</span>
                  } @else {
                    <span class="set-num num">{{ set.setNumber }}</span>
                  }
                </div>

                <div class="col-kg">
                  <div class="stepper">
                    <button class="step-btn" (click)="workout.updateSetWeight(idx, -2.5)" [disabled]="set.completed">-</button>
                    <span class="stepper-val num">{{ set.weightKg }}</span>
                    <button class="step-btn" (click)="workout.updateSetWeight(idx, 2.5)" [disabled]="set.completed">+</button>
                  </div>
                </div>

                <div class="col-reps">
                  <div class="stepper">
                    <button class="step-btn" (click)="workout.updateSetReps(idx, -1)" [disabled]="set.completed">-</button>
                    <span class="stepper-val num">{{ set.reps }}</span>
                    <button class="step-btn" (click)="workout.updateSetReps(idx, 1)" [disabled]="set.completed">+</button>
                  </div>
                </div>

                <div class="col-rpe">
                  <span class="rpe-badge num">{{ set.rpe || '–' }}</span>
                </div>

                <div class="col-action">
                  @if (set.completed) {
                    <button class="check-btn done" title="Set completed">
                      ✓
                    </button>
                  } @else {
                    <button
                      class="check-btn"
                      (click)="workout.completeCurrentSet(idx)"
                      title="Tap to complete set"
                    >
                      ✓
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Rest Timer Floating Alert when running -->
          @if (workout.liveSession().restTimerRunning) {
            <div class="rest-banner">
              <div class="rest-timer-display">
                <app-icon name="timer" [size]="18" />
                <span>Rest Interval: <strong>00:{{ workout.liveSession().restSecondsLeft < 10 ? '0' : '' }}{{ workout.liveSession().restSecondsLeft }}</strong></span>
              </div>
              <button class="btn btn-ghost skip-rest-btn" (click)="skipRest()">Skip Rest</button>
            </div>
          }

          <!-- Quick Actions -->
          <div class="logger-actions">
            <button class="btn btn-secondary w-full" (click)="addGhostSet()">
              + Add Set (Same as Last)
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .live-session-page {
      max-width: 1300px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }

    .session-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--s-2) 0;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--text);
      text-decoration: none;
      font-size: var(--fs-md);
      font-weight: 700;
    }
    .topbar-title {
      font-family: var(--font-display);
      font-size: var(--fs-lg);
    }
    .timer-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      padding: 6px 16px;
      border-radius: var(--r-pill);
      font-size: var(--fs-sm);
      font-weight: 700;
    }
    .rec-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--danger);
      box-shadow: 0 0 8px var(--danger);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    .finish-btn {
      font-size: var(--fs-xs);
      padding: 6px 16px;
    }

    /* Live Grid */
    .live-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-5);
    }

    /* Hero Stage */
    .hero-stage {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .stage-media {
      position: relative;
      height: 380px;
      background: var(--surface-2);
    }
    .stage-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: contrast(1.1) brightness(0.85);
    }
    .stage-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(11, 16, 21, 0.4) 0%, rgba(11, 16, 21, 0.95) 100%);
      padding: var(--s-4);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .exercise-name {
      font-size: 1.5rem;
      color: var(--text);
    }
    .set-counter {
      font-size: var(--fs-xs);
      color: var(--text-muted);
    }

    .dial-container {
      display: flex;
      align-items: center;
      gap: var(--s-5);
    }
    .dial-reps {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--text);
      line-height: 1;
    }
    .dial-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .dial-meta {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .m-lbl {
      font-size: 0.65rem;
      color: var(--text-faint);
      text-transform: uppercase;
    }
    .m-val {
      font-size: var(--fs-md);
      font-weight: 700;
      color: var(--text);
    }
    .rest-num {
      color: var(--accent-1);
    }

    /* AI Tip Card */
    .ai-tip-card {
      padding: var(--s-3) var(--s-4);
      background: var(--surface-2);
      border-top: 1px solid var(--border);
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .tip-icon {
      color: var(--primary);
      margin-top: 2px;
    }
    .tip-title {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .tip-content {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* Logger Stage */
    .logger-stage {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .logger-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .sets-table {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .table-header {
      display: grid;
      grid-template-columns: 48px 1fr 1fr 50px 50px;
      gap: 8px;
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text-faint);
      padding: 0 8px;
    }
    .set-row {
      display: grid;
      grid-template-columns: 48px 1fr 1fr 50px 50px;
      gap: 8px;
      align-items: center;
      padding: 8px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-input);
      transition: all var(--t-fast) var(--ease);
    }
    .set-row.completed {
      border-color: var(--primary-line);
      background: var(--surface-3);
    }
    .set-row.warmup {
      opacity: 0.85;
    }

    .set-num {
      font-weight: 700;
      font-size: var(--fs-sm);
    }
    .warmup-badge {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--accent-2);
    }

    .stepper {
      display: flex;
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 2px;
    }
    .step-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      color: var(--text-muted);
      font-size: var(--fs-sm);
      font-weight: 700;
    }
    .step-btn:hover:not(:disabled) {
      color: var(--text);
      background: var(--surface-2);
    }
    .stepper-val {
      flex: 1;
      text-align: center;
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text);
    }

    .rpe-badge {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      text-align: center;
      display: block;
    }

    .check-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--r-pill);
      border: 1.5px solid var(--border-strong);
      background: var(--surface);
      color: var(--text-muted);
      font-size: var(--fs-sm);
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--t-fast) var(--ease);
    }
    .check-btn:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    .check-btn.done {
      background: var(--primary);
      border-color: var(--primary);
      color: var(--on-primary);
    }

    .rest-banner {
      background: var(--surface-3);
      border: 1px solid var(--accent-1);
      border-radius: var(--r-input);
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--accent-1);
      font-size: var(--fs-xs);
    }
    .rest-timer-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .skip-rest-btn {
      font-size: var(--fs-xs);
      padding: 4px 10px;
      min-height: 28px;
      color: var(--text-muted);
    }

    .w-full {
      width: 100%;
    }

    @media (max-width: 900px) {
      .live-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LiveSessionComponent {
  workout = inject(WorkoutService);

  formattedTime = computed(() => {
    const s = this.workout.liveSession().elapsedSeconds;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
  });

  skipRest() {
    this.workout.liveSession.update(s => ({
      ...s,
      restTimerRunning: false,
      restSecondsLeft: 0
    }));
  }

  addGhostSet() {
    const ex = this.workout.currentExercise();
    const lastSet = ex.sets[ex.sets.length - 1];
    const newSet = {
      setNumber: ex.sets.length + 1,
      weightKg: lastSet ? lastSet.weightKg : 100,
      reps: lastSet ? lastSet.reps : 8,
      rpe: lastSet ? lastSet.rpe : 8,
      completed: false
    };
    this.workout.liveSession.update(s => {
      const updatedExercises = [...s.exercises];
      updatedExercises[s.currentExerciseIndex] = {
        ...ex,
        sets: [...ex.sets, newSet]
      };
      return { ...s, exercises: updatedExercises };
    });
  }

  finishWorkout() {
    this.workout.finishSession();
    alert('Session complete! Great job Alex. Volume: 3,420 kg · 4 sets logged · Readiness protected.');
  }
}
