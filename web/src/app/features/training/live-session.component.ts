import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { WorkoutService, CompletedSessionItem } from '../../core/services/workout.service';
import { NotificationService } from '../../core/services/notification.service';
import { ExerciseModalComponent } from '../../shared/ui/exercise-modal/exercise-modal.component';

@Component({
  selector: 'app-live-session',
  standalone: true,
  imports: [RouterLink, DecimalPipe, IconComponent, ExerciseModalComponent],
  template: `
    <div class="live-session-page">
      <!-- Session Top Bar with Live Telemetry -->
      <header class="session-topbar">
        <a routerLink="/training" class="back-link">
          <app-icon name="chevron-left" [size]="20" />
          <span class="topbar-title">Live Session</span>
        </a>

        <!-- Live Telemetry HUD Strip -->
        <div class="topbar-session-info">
          <div class="hud-chip timer-chip">
            <span class="pulse-dot"></span>
            <span class="hud-val num">{{ sessionTimeFormatted() }}</span>
          </div>
          <div class="hud-chip volume-chip" [class.pulse-bump]="tonnagePulsing()">
            <app-icon name="barbell" [size]="14" />
            <span class="hud-val num">{{ liveTonnage() | number }} kg</span>
            <span class="hud-lbl">VOL</span>
          </div>
          <div class="hud-chip progress-chip">
            <span class="hud-val num">{{ completedSetsCount() }}/{{ totalSetsCount() }}</span>
            <span class="hud-lbl">SETS</span>
          </div>
        </div>

        <button class="btn btn-primary finish-btn" (click)="finishWorkout()">
          <app-icon name="trophy" [size]="16" />
          <span>Finish Workout</span>
        </button>
      </header>

      <!-- Floating / Embedded Interactive Rest Timer HUD -->
      @if (restTimerActive()) {
        <div class="rest-timer-strip card animated-slide-down">
          <div class="rest-left">
            <div class="rest-pulsing-icon">
              <app-icon name="zap" [size]="20" />
            </div>
            <div class="rest-info">
              <div class="rest-title-row">
                <span class="rest-title">Rest & Metabolic Recovery</span>
                <span class="rest-tag">ATP-CP Replenishing</span>
              </div>
              <div class="rest-countdown num">{{ restTimeFormatted() }}</div>
            </div>
          </div>

          <div class="rest-controls">
            <button class="btn btn-ghost btn-sm" (click)="adjustRest(-15)">-15s</button>
            <button class="btn btn-ghost btn-sm" (click)="adjustRest(15)">+15s</button>
            <button class="btn btn-primary btn-sm skip-rest-btn" (click)="skipRest()">
              Skip Rest ⏭
            </button>
          </div>
        </div>
      }

      <!-- Set Completion Toast Notification -->
      @if (showSetCelebration()) {
        <div class="set-celebration-toast animated-bounce">
          <span class="celeb-icon">⚡</span>
          <span>SET COMPLETED: +{{ lastLoggedSetWeight() | number }} kg Volume Added!</span>
        </div>
      }

      <!-- 4-Exercise Stepper Tabs Bar -->
      <div class="exercise-stepper-bar">
        @for (item of workout.liveSession().exercises; track item.exercise.id; let idx = $index) {
          <button
            class="ex-step-tab"
            [class.active]="workout.liveSession().currentExerciseIndex === idx"
            (click)="workout.setExerciseIndex(idx)"
          >
            <span class="step-num">{{ idx + 1 }}</span>
            <span class="step-name">{{ item.exercise.name }}</span>
            @if (isExerciseAllCompleted(item)) {
              <span class="step-done-badge">✓</span>
            }
          </button>
        }
      </div>

      <!-- Main Live Split: Visual on left, Logger on right -->
      <div class="live-grid">
        <!-- Visual & Form Stage -->
        <div class="hero-stage card">
          <div class="stage-media">
            @if (workout.currentExercise().exercise.videoUrl) {
              <video
                [src]="workout.currentExercise().exercise.videoUrl"
                [poster]="workout.currentExercise().exercise.image"
                autoplay
                loop
                muted
                playsinline
                class="stage-img stage-video"
              ></video>
            } @else if (workout.currentExercise().exercise.image) {
              <img [src]="workout.currentExercise().exercise.image" alt="Exercise Form" class="stage-img" />
            } @else {
              <div class="stage-schematic-bg">
                <span class="schematic-target-badge">{{ workout.currentExercise().exercise.muscle }}</span>
                <span class="schematic-exercise-name">{{ workout.currentExercise().exercise.name }}</span>
              </div>
            }
            <div class="stage-overlay">
              <div class="stage-header">
                <div>
                  <h2 class="exercise-name">{{ workout.currentExercise().exercise.name }}</h2>
                  <p class="set-counter">
                    Exercise {{ workout.liveSession().currentExerciseIndex + 1 }} of {{ workout.liveSession().exercises.length }} · {{ workout.currentExercise().targetSets }} Sets Target
                  </p>
                </div>
                <button class="view-form-btn" (click)="showFormModal.set(true)" title="View 3D form demonstration">
                  <app-icon name="play" [size]="14" />
                  <span>3D Form & Video</span>
                </button>
              </div>

              <!-- Exercise Targets (Replaces Timer Ring) -->
              <div class="exercise-target-card">
                <div class="target-item">
                  <span class="t-lbl">Target Sets</span>
                  <span class="t-val num">{{ workout.currentExercise().targetSets }}</span>
                </div>
                <div class="target-divider"></div>
                <div class="target-item">
                  <span class="t-lbl">Target Reps</span>
                  <span class="t-val num">{{ workout.currentExercise().targetReps }}</span>
                </div>
                <div class="target-divider"></div>
                <div class="target-item">
                  <span class="t-lbl">Focus</span>
                  <span class="t-val focus-txt">Controlled Tempo</span>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Coaching Tip -->
          <div class="ai-tip-card">
            <div class="tip-icon">
              <app-icon name="robot" [size]="18" />
            </div>
            <div class="tip-text">
              <div class="tip-title">AI Biomechanical Cue</div>
              <div class="tip-content">
                {{ workout.currentExercise().exercise.formCues?.[0] || 'Maintain rigid core bracing and drive through the full range of motion.' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Interactive Set Logger Sheet -->
        <div class="logger-stage card">
          <div class="logger-header">
            <div>
              <h3>Set Logger</h3>
              <span class="logger-sub">{{ workout.currentExercise().exercise.name }}</span>
            </div>
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
                      (click)="logSetWithCelebration(idx, set)"
                      title="Tap to complete set"
                    >
                      ✓
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Set Actions -->
          <div class="logger-actions">
            <button class="btn btn-secondary w-full" (click)="addGhostSet()">
              + Add Set (Same as Last)
            </button>
          </div>

          <!-- Exercise Navigation (Switch between all 4 exercises) -->
          <div class="ex-nav-row">
            <button
              class="btn btn-secondary nav-ex-btn"
              [disabled]="workout.liveSession().currentExerciseIndex === 0"
              (click)="prevExercise()"
            >
              ← Previous Move
            </button>
            <span class="ex-nav-indicator">
              {{ workout.liveSession().currentExerciseIndex + 1 }} / {{ workout.liveSession().exercises.length }}
            </span>
            <button
              class="btn btn-primary nav-ex-btn"
              [disabled]="workout.liveSession().currentExerciseIndex === workout.liveSession().exercises.length - 1"
              (click)="nextExercise()"
            >
              Next Move →
            </button>
          </div>
        </div>
      </div>
    </div>

    @if (showFormModal()) {
      <app-exercise-modal
        [exercise]="workout.currentExercise().exercise"
        (closed)="showFormModal.set(false)"
      />
    }

    <!-- WORKOUT CONQUERED ACHIEVEMENT CELEBRATION MODAL -->
    @if (showConqueredModal()) {
      <div class="modal-backdrop celebration-backdrop" (click)="showConqueredModal.set(false)">
        <div class="modal-card conquered-card card animated-scale-up" (click)="$event.stopPropagation()">
          <div class="conquered-confetti-fx"></div>
          
          <div class="conquered-head">
            <div class="trophy-badge-ring">
              <span class="trophy-emoji">🏆</span>
            </div>
            <span class="conquered-badge">OLYMPIC DISCIPLINE</span>
            <h2 class="conquered-title">WORKOUT CONQUERED!</h2>
            <p class="conquered-sub">{{ workout.liveSession().sessionTitle }} completed with 100% volume adherence.</p>
          </div>

          <!-- 4 Summary Telemetry Tiles -->
          <div class="conquered-metrics-grid">
            <div class="c-metric-tile">
              <span class="cm-lbl">TOTAL TONNAGE</span>
              <span class="cm-val num stat-cyan">{{ liveTonnage() | number }} kg</span>
              <span class="cm-sub">Direct mechanical load</span>
            </div>
            <div class="c-metric-tile">
              <span class="cm-lbl">SETS RECORDED</span>
              <span class="cm-val num stat-green">{{ completedSetsCount() }} Sets</span>
              <span class="cm-sub">{{ workout.liveSession().exercises.length }} Exercises</span>
            </div>
            <div class="c-metric-tile">
              <span class="cm-lbl">TOTAL DURATION</span>
              <span class="cm-val num text-primary">{{ sessionTimeFormatted() }}</span>
              <span class="cm-sub">Active training time</span>
            </div>
            <div class="c-metric-tile">
              <span class="cm-lbl">KINEMATIC FORM</span>
              <span class="cm-val num stat-orange">98%</span>
              <span class="cm-sub">Bar path & stability</span>
            </div>
          </div>

          <!-- Achievement Unlocks Box -->
          <div class="conquered-achievements-box">
            <div class="ca-header">
              <span class="ca-icon">⭐</span>
              <span class="ca-title">Milestones & XP Unlocked</span>
            </div>
            <div class="ca-items">
              <div class="ca-item">
                <span class="ca-badge">🏅 NEW PR</span>
                <span class="ca-text">Peak Working Set: {{ workout.currentExercise().exercise.name }}</span>
              </div>
              <div class="ca-item">
                <span class="ca-badge">🔥 5-DAY STREAK</span>
                <span class="ca-text">Consistency bonus activated (+150 XP)</span>
              </div>
              <div class="ca-item">
                <span class="ca-badge">⚡ LEVEL 14</span>
                <span class="ca-text">+450 XP Added to Athlete Profile</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="conquered-actions">
            <button class="btn btn-secondary" (click)="showConqueredModal.set(false)">
              Review Sets
            </button>
            <button class="btn btn-primary claim-btn" (click)="confirmFinishWorkout()">
              <app-icon name="check" [size]="16" />
              <span>Claim XP & Save to Calendar →</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .live-session-page {
      max-width: 1300px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }

    .session-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--s-2) 0;
      gap: var(--s-2);
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
    .topbar-session-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .hud-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      padding: 5px 12px;
      border-radius: var(--r-pill);
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text);
      transition: all 0.2s ease;
    }
    .timer-chip {
      border-color: rgba(204, 255, 0, 0.3);
      color: var(--primary);
    }
    .volume-chip {
      border-color: rgba(56, 189, 248, 0.3);
      color: #38bdf8;
    }
    .volume-chip.pulse-bump {
      transform: scale(1.1);
      border-color: var(--primary);
      box-shadow: 0 0 14px var(--primary);
      color: var(--primary);
    }
    .progress-chip {
      color: var(--text-muted);
    }
    .hud-val {
      font-weight: 800;
      font-size: 0.85rem;
    }
    .hud-lbl {
      font-size: 0.65rem;
      letter-spacing: 0.05em;
      opacity: 0.7;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 10px var(--primary);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .finish-btn {
      padding: 8px 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Rest Timer Strip */
    .rest-timer-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 18px;
      background: rgba(14, 21, 30, 0.95);
      border: 1px solid rgba(204, 255, 0, 0.35);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      gap: 12px;
      margin-bottom: 4px;
      border-radius: var(--r-card);
    }
    .rest-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .rest-pulsing-icon {
      color: var(--primary);
      animation: pulse 1s infinite alternate;
    }
    .rest-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .rest-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .rest-title {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text);
    }
    .rest-tag {
      font-size: 0.65rem;
      color: var(--primary);
      background: rgba(204, 255, 0, 0.1);
      padding: 1px 6px;
      border-radius: 4px;
      letter-spacing: 0.03em;
    }
    .rest-countdown {
      font-size: 1.4rem;
      font-weight: 900;
      color: var(--primary);
      letter-spacing: 0.04em;
    }
    .rest-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .skip-rest-btn {
      font-size: 0.78rem;
      padding: 6px 14px;
    }

    /* Set Celebration Toast */
    .set-celebration-toast {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary);
      color: #000;
      font-weight: 800;
      font-size: 0.85rem;
      padding: 10px 22px;
      border-radius: var(--r-pill);
      box-shadow: 0 6px 25px rgba(204, 255, 0, 0.4);
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 1000;
    }
    .celeb-icon {
      font-size: 1rem;
    }

    /* Conquered Celebration Modal */
    .celebration-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(8px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--s-4);
    }
    .conquered-card {
      max-width: 580px;
      width: 100%;
      background: var(--surface);
      border: 1px solid rgba(204, 255, 0, 0.4);
      box-shadow: 0 0 50px rgba(204, 255, 0, 0.15), 0 20px 40px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      position: relative;
      overflow: hidden;
      padding: var(--s-5);
    }
    .conquered-head {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .trophy-badge-ring {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(204, 255, 0, 0.25) 0%, rgba(204, 255, 0, 0.05) 70%);
      border: 2px solid var(--primary);
      box-shadow: 0 0 25px rgba(204, 255, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 6px;
    }
    .trophy-emoji {
      font-size: 2rem;
    }
    .conquered-badge {
      font-size: 0.7rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .conquered-title {
      font-family: var(--font-display);
      font-size: 2rem;
      letter-spacing: 0.04em;
      color: var(--text);
    }
    .conquered-sub {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      max-width: 440px;
    }
    .conquered-metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    .c-metric-tile {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-card);
      padding: 10px 8px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .cm-lbl {
      font-size: 0.62rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.04em;
    }
    .cm-val {
      font-size: 1.15rem;
      font-weight: 900;
    }
    .cm-sub {
      font-size: 0.58rem;
      color: var(--text-faint);
    }
    .conquered-achievements-box {
      background: rgba(204, 255, 0, 0.04);
      border: 1px solid rgba(204, 255, 0, 0.2);
      border-radius: var(--r-card);
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ca-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--primary);
    }
    .ca-items {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ca-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.78rem;
    }
    .ca-badge {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--surface-3);
      color: var(--text);
    }
    .ca-text {
      color: var(--text);
    }
    .conquered-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--s-3);
      margin-top: 4px;
    }
    .claim-btn {
      padding: 10px 22px;
      font-weight: 800;
    }

    /* 4-Exercise Stepper Tabs Bar */
    .exercise-stepper-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      padding: 4px 0 8px;
      scrollbar-width: none;
    }
    .exercise-stepper-bar::-webkit-scrollbar {
      display: none;
    }
    .ex-step-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: var(--r-pill);
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--t-fast) var(--ease);
    }
    .ex-step-tab:hover {
      background: var(--surface-2);
      color: var(--text);
    }
    .ex-step-tab.active {
      background: rgba(34, 197, 94, 0.15);
      border-color: var(--primary);
      color: var(--text);
      font-weight: 700;
    }
    .step-num {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--surface-2);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 800;
    }
    .ex-step-tab.active .step-num {
      background: var(--primary);
      color: var(--on-primary);
    }
    .step-done-badge {
      color: var(--primary);
      font-weight: 900;
      font-size: 0.85rem;
    }

    /* Main Live Split Grid */
    .live-grid {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: var(--s-4);
      align-items: start;
    }

    /* Hero Visual Stage */
    .hero-stage {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .stage-media {
      position: relative;
      height: 380px;
      background: #000;
      overflow: hidden;
    }
    .stage-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: contrast(1.1) brightness(0.85);
    }
    .stage-schematic-bg {
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 75% 25%, rgba(34, 197, 94, 0.12) 0%, rgba(11, 16, 21, 0.98) 75%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }
    .schematic-target-badge {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .schematic-exercise-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: #fff;
    }
    .stage-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(11, 16, 21, 0.75) 0%, transparent 40%, rgba(11, 16, 21, 0.95) 100%);
      padding: var(--s-4);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .stage-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--s-3);
    }
    .view-form-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(11, 16, 21, 0.75);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 14px;
      border-radius: var(--r-pill);
      font-size: var(--fs-xs);
      font-weight: 700;
      cursor: pointer;
      backdrop-filter: blur(8px);
      transition: all var(--t-fast) var(--ease);
    }
    .view-form-btn:hover {
      background: var(--primary);
      color: var(--on-primary);
    }
    .exercise-name {
      font-size: 1.4rem;
      color: var(--text);
    }
    .set-counter {
      font-size: var(--fs-xs);
      color: var(--text-muted);
    }

    /* Target Box (No Timer) */
    .exercise-target-card {
      background: rgba(11, 16, 21, 0.85);
      border: 1px solid var(--border);
      backdrop-filter: blur(8px);
      padding: 12px 20px;
      border-radius: var(--r-lg);
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 16px;
    }
    .target-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .t-lbl {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 700;
    }
    .t-val {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--text);
    }
    .focus-txt {
      font-size: 0.82rem;
      color: var(--primary);
    }
    .target-divider {
      width: 1px;
      height: 28px;
      background: var(--border);
    }

    /* AI Coaching Tip */
    .ai-tip-card {
      padding: var(--s-3) var(--s-4);
      background: var(--surface);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      border-top: 1px solid var(--border);
    }
    .tip-icon {
      color: var(--primary);
      margin-top: 2px;
    }
    .tip-title {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .tip-content {
      font-size: 0.85rem;
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
    .logger-header h3 {
      font-size: 1.15rem;
    }
    .logger-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .sets-table {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .table-header {
      display: grid;
      grid-template-columns: 48px 1fr 1fr 50px 48px;
      gap: 10px;
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--text-faint);
      padding: 0 4px;
    }
    .set-row {
      display: grid;
      grid-template-columns: 48px 1fr 1fr 50px 48px;
      gap: 10px;
      align-items: center;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 8px 10px;
      transition: all var(--t-fast) var(--ease);
    }
    .set-row.completed {
      background: rgba(34, 197, 94, 0.05);
      border-color: rgba(34, 197, 94, 0.3);
    }
    .col-set {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .set-num {
      font-weight: 800;
      font-size: var(--fs-sm);
    }
    .warmup-badge {
      font-size: 0.65rem;
      font-weight: 800;
      background: var(--surface-3);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--text-muted);
    }
    .stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 2px;
    }
    .step-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-weight: 800;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--t-fast) var(--ease);
    }
    .step-btn:hover:not(:disabled) {
      background: var(--surface-2);
      color: var(--text);
    }
    .step-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .stepper-val {
      font-weight: 700;
      font-size: 0.88rem;
    }
    .col-rpe {
      text-align: center;
    }
    .rpe-badge {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-muted);
    }
    .check-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--r-md);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
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

    .logger-actions {
      display: flex;
      gap: 8px;
    }

    /* Move Navigation Controls */
    .ex-nav-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: var(--s-3);
      border-top: 1px solid var(--border);
    }
    .nav-ex-btn {
      padding: 8px 16px;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .ex-nav-indicator {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text-muted);
    }

    @media (max-width: 768px) {
      .live-grid {
        grid-template-columns: 1fr;
        gap: var(--s-3);
      }
      .stage-media {
        height: 260px;
      }
      .table-header, .set-row {
        grid-template-columns: 36px 1fr 1fr 38px 36px;
        gap: 6px;
        padding: 6px 8px;
      }
      .stepper-val {
        font-size: 0.78rem;
      }
      .step-btn {
        width: 22px;
        height: 22px;
      }
      .check-btn {
        width: 32px;
        height: 32px;
      }
    }

    @media (max-width: 600px) {
      .session-topbar {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      .topbar-right {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 8px;
      }
      .finish-btn {
        flex: 1;
        justify-content: center;
      }
      .table-header, .set-row {
        grid-template-columns: 30px 1fr 1fr 34px 34px;
        gap: 4px;
        padding: 6px 4px;
      }
      .stepper {
        padding: 1px;
      }
      .stepper-val {
        font-size: 0.72rem;
      }
      .step-btn {
        width: 20px;
        height: 20px;
        font-size: 0.8rem;
      }
    }
  `]
})
export class LiveSessionComponent implements OnInit, OnDestroy {
  workout = inject(WorkoutService);
  private notif = inject(NotificationService);
  private router = inject(Router);

  showFormModal = signal<boolean>(false);
  showConqueredModal = signal<boolean>(false);

  // Live Timer
  elapsedSeconds = signal<number>(0);
  private timerInterval: any = null;

  sessionTimeFormatted = computed(() => {
    const totalSecs = this.elapsedSeconds();
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  // Real-time live tonnage computed from completed sets
  liveTonnage = computed(() => {
    return this.workout.liveSession().exercises.reduce((acc, ex) => {
      return acc + (ex.sets || []).filter(s => s.completed).reduce((sAcc, s) => sAcc + ((s.weightKg || 0) * (s.reps || 0)), 0);
    }, 0);
  });

  completedSetsCount = computed(() => {
    return this.workout.liveSession().exercises.reduce((acc, ex) => acc + (ex.sets || []).filter(s => s.completed).length, 0);
  });

  totalSetsCount = computed(() => {
    return this.workout.liveSession().exercises.reduce((acc, ex) => acc + (ex.sets || []).length, 0);
  });

  // Rest Timer
  restTimerActive = signal<boolean>(false);
  restSecondsLeft = signal<number>(90);
  private restInterval: any = null;

  restTimeFormatted = computed(() => {
    const s = this.restSecondsLeft();
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  });

  // Set Celebration Flash
  showSetCelebration = signal<boolean>(false);
  lastLoggedSetWeight = signal<number>(0);
  tonnagePulsing = signal<boolean>(false);

  ngOnInit() {
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.update(s => s + 1);
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.restInterval) clearInterval(this.restInterval);
  }

  startRestTimer(seconds: number = 90) {
    if (this.restInterval) clearInterval(this.restInterval);
    this.restSecondsLeft.set(seconds);
    this.restTimerActive.set(true);

    this.restInterval = setInterval(() => {
      const left = this.restSecondsLeft() - 1;
      if (left <= 0) {
        clearInterval(this.restInterval);
        this.restTimerActive.set(false);
      } else {
        this.restSecondsLeft.set(left);
      }
    }, 1000);
  }

  adjustRest(delta: number) {
    this.restSecondsLeft.update(s => Math.max(0, s + delta));
  }

  skipRest() {
    if (this.restInterval) clearInterval(this.restInterval);
    this.restTimerActive.set(false);
  }

  logSetWithCelebration(idx: number, set: any) {
    this.workout.completeCurrentSet(idx);
    const vol = (set.weightKg || 0) * (set.reps || 0);
    this.lastLoggedSetWeight.set(vol);
    this.showSetCelebration.set(true);
    this.tonnagePulsing.set(true);
    setTimeout(() => this.tonnagePulsing.set(false), 500);
    setTimeout(() => this.showSetCelebration.set(false), 2200);

    // Auto trigger rest timer
    this.startRestTimer(90);
  }

  isExerciseAllCompleted(item: any): boolean {
    return item.sets && item.sets.length > 0 && item.sets.every((s: any) => s.completed);
  }

  nextExercise() {
    const s = this.workout.liveSession();
    if (s.currentExerciseIndex < s.exercises.length - 1) {
      this.workout.setExerciseIndex(s.currentExerciseIndex + 1);
    }
  }

  prevExercise() {
    const s = this.workout.liveSession();
    if (s.currentExerciseIndex > 0) {
      this.workout.setExerciseIndex(s.currentExerciseIndex - 1);
    }
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
    this.showConqueredModal.set(true);
  }

  confirmFinishWorkout() {
    this.showConqueredModal.set(false);
    const record = this.workout.finishSession();
    this.notif.addNotification({
      type: 'workout',
      title: 'Workout Conquered! 🏆',
      message: `Completed "${record.title}" with ${record.totalSets} sets and ${record.totalVolumeKg} kg tonnage.`,
      icon: '🏆',
      link: '/training'
    });
    this.router.navigate(['/training'], { queryParams: { tab: 'calendar', recorded: record.id, justFinished: 'true' } });
  }
}
