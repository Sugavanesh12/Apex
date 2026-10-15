import { Component, computed, inject, signal } from '@angular/core';
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
          <span>Recovery Hub</span>
        </a>
        <div class="title-row">
          <h2>Daily Recovery Check-in</h2>
          <span class="live-badge">
            <span class="pulse-dot"></span> Live Biometrics
          </span>
        </div>
        <p class="header-sub">Log daily physiological subjective markers to calibrate training intensity & volume.</p>
      </header>

      <!-- Mood Selection Row with Bouncy Animations -->
      <div class="mood-selector card">
        <div class="section-label">Current Mood & Mental State</div>
        <div class="mood-grid">
          @for (m of moodOptions; track m.label) {
            <button
              class="mood-btn"
              [class.selected]="recovery.checkin().mood === m.label"
              (click)="selectMood(m.label)"
            >
              <span class="mood-face">{{ m.emoji }}</span>
              <span class="mood-lbl">{{ m.label }}</span>
              @if (recovery.checkin().mood === m.label) {
                <span class="active-indicator"></span>
              }
            </button>
          }
        </div>
      </div>

      <!-- Signals 2x2 Grid -->
      <div class="signals-grid">
        <!-- 1. Dynamic Sleep Card with Hypnogram Cycles -->
        <div class="signal-card card sleep-card">
          <div class="signal-head">
            <div class="sig-title-group">
              <span class="sig-icon-wrap moon">
                <app-icon name="sleep" [size]="16" />
              </span>
              <span class="sig-title">Sleep Duration</span>
            </div>
            <div class="val-group">
              <span class="sig-val num">{{ formatSleepHours(recovery.checkin().sleepHours) }}</span>
              <span class="sig-quality-tag" [class.optimal]="recovery.checkin().sleepHours >= 7 && recovery.checkin().sleepHours <= 9">
                {{ sleepQualityLabel() }}
              </span>
            </div>
          </div>

          <!-- Dynamic Animated Sleep Stages / Hypnogram Visualization -->
          <div class="hypnogram-wrap">
            <div class="hypno-bars">
              @for (bar of sleepBars(); track bar.id) {
                <div class="hypno-bar-col">
                  <div
                    class="hypno-bar-fill"
                    [style.height.%]="bar.height"
                    [class.deep]="bar.type === 'deep'"
                    [class.rem]="bar.type === 'rem'"
                    [class.light]="bar.type === 'light'"
                  ></div>
                  <span class="hypno-label">{{ bar.label }}</span>
                </div>
              }
            </div>
            <div class="hypno-ambient-line"></div>
          </div>

          <div class="slider-stepper">
            <button class="step-btn" (click)="adjustSleep(-0.5)" aria-label="Decrease sleep">-</button>
            <div class="stepper-center">
              <span class="step-metric num">{{ recovery.checkin().sleepHours }} hrs</span>
              <span class="step-hint">±30m increments</span>
            </div>
            <button class="step-btn" (click)="adjustSleep(0.5)" aria-label="Increase sleep">+</button>
          </div>
        </div>

        <!-- 2. Dynamic Stress Card with Real-time Flowing Sine Wave -->
        <div class="signal-card card stress-card">
          <div class="signal-head">
            <div class="sig-title-group">
              <span class="sig-icon-wrap stress">
                <app-icon name="heart" [size]="16" />
              </span>
              <span class="sig-title">Nervous System Stress</span>
            </div>
            <div class="val-group">
              <span class="sig-val num">{{ recovery.checkin().stressLevel }}/10</span>
              <span class="sig-stress-tag" [class.low]="recovery.checkin().stressLevel <= 3" [class.med]="recovery.checkin().stressLevel > 3 && recovery.checkin().stressLevel <= 6" [class.high]="recovery.checkin().stressLevel > 6">
                {{ stressLabel() }}
              </span>
            </div>
          </div>

          <!-- Flowing Animated Biometrics Wave Graphic -->
          <div class="wave-graphic-container">
            <svg viewBox="0 0 240 40" class="wave-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="stressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" [attr.stop-color]="waveStartColor()" />
                  <stop offset="100%" [attr.stop-color]="waveEndColor()" />
                </linearGradient>
              </defs>
              <!-- Animated flowing sine wave path -->
              <path
                [attr.d]="dynamicWavePath()"
                fill="none"
                stroke="url(#stressGrad)"
                stroke-width="2.5"
                stroke-linecap="round"
                class="flowing-path"
                [style.animationDuration]="waveSpeed()"
              />
            </svg>
            <div class="wave-pulse-glow" [style.background]="wavePulseColor()"></div>
          </div>

          <div class="slider-stepper">
            <button class="step-btn" (click)="adjustStress(-1)" aria-label="Decrease stress">-</button>
            <div class="stepper-center">
              <span class="step-metric num">Level {{ recovery.checkin().stressLevel }}</span>
              <span class="step-hint">Autonomic tone</span>
            </div>
            <button class="step-btn" (click)="adjustStress(1)" aria-label="Increase stress">+</button>
          </div>
        </div>

        <!-- 3. Dynamic Muscle Soreness Card with 10-Segment Heatmap -->
        <div class="signal-card card soreness-card">
          <div class="signal-head">
            <div class="sig-title-group">
              <span class="sig-icon-wrap flame">
                <app-icon name="flame" [size]="16" />
              </span>
              <span class="sig-title">Muscle Soreness (DOMS)</span>
            </div>
            <div class="val-group">
              <span class="sig-val num">{{ recovery.checkin().sorenessLevel }}/10</span>
              <span class="sig-soreness-tag" [class.low]="recovery.checkin().sorenessLevel <= 3" [class.med]="recovery.checkin().sorenessLevel > 3 && recovery.checkin().sorenessLevel <= 6" [class.high]="recovery.checkin().sorenessLevel > 6">
                {{ sorenessLabel() }}
              </span>
            </div>
          </div>

          <!-- Dynamic 10-Segment Soreness Heatmap Bars -->
          <div class="soreness-meter">
            @for (level of [1,2,3,4,5,6,7,8,9,10]; track level) {
              <div
                class="soreness-bar"
                [class.active]="recovery.checkin().sorenessLevel >= level"
                [class.mild-bar]="level <= 3"
                [class.med-bar]="level > 3 && level <= 6"
                [class.severe-bar]="level > 6"
                [style.animationDelay.ms]="level * 40"
              ></div>
            }
          </div>

          <div class="slider-stepper">
            <button class="step-btn" (click)="adjustSoreness(-1)" aria-label="Decrease soreness">-</button>
            <div class="stepper-center">
              <span class="step-metric num">DOMS: {{ recovery.checkin().sorenessLevel }}/10</span>
              <span class="step-hint">Peripheral recovery</span>
            </div>
            <button class="step-btn" (click)="adjustSoreness(1)" aria-label="Increase soreness">+</button>
          </div>
        </div>

        <!-- 4. Dynamic Energy Equalizer Card with Vitality Pulse -->
        <div class="signal-card card energy-card">
          <div class="signal-head">
            <div class="sig-title-group">
              <span class="sig-icon-wrap zap">
                <app-icon name="zap" [size]="16" />
              </span>
              <span class="sig-title">Perceived Energy</span>
            </div>
            <div class="val-group">
              <span class="sig-val num">{{ recovery.checkin().energyLevel }}/10</span>
              <span class="sig-energy-tag" [class.high]="recovery.checkin().energyLevel >= 7" [class.med]="recovery.checkin().energyLevel >= 4 && recovery.checkin().energyLevel < 7" [class.low]="recovery.checkin().energyLevel < 4">
                {{ energyLabel() }}
              </span>
            </div>
          </div>

          <!-- Dynamic Kinetic Equalizer Bars with Oscillating Heights -->
          <div class="energy-equalizer">
            @for (bar of [1,2,3,4,5,6,7,8,9,10]; track bar) {
              <div
                class="eq-bar"
                [class.active]="recovery.checkin().energyLevel >= bar"
                [class.pulse-active]="recovery.checkin().energyLevel >= bar"
                [style.height.%]="getEqualizerHeight(bar)"
                [style.animationDelay.ms]="(bar * 70) % 500"
              ></div>
            }
          </div>

          <div class="slider-stepper">
            <button class="step-btn" (click)="adjustEnergy(-1)" aria-label="Decrease energy">-</button>
            <div class="stepper-center">
              <span class="step-metric num">Vitality: {{ recovery.checkin().energyLevel }}/10</span>
              <span class="step-hint">Metabolic drive</span>
            </div>
            <button class="step-btn" (click)="adjustEnergy(1)" aria-label="Increase energy">+</button>
          </div>
        </div>
      </div>

      <!-- Live Calculated Readiness Meter HUD (Reactive Heuristic) -->
      <div class="calculated-preview card">
        <div class="preview-gauge-wrap">
          <svg viewBox="0 0 100 100" class="radial-gauge-svg">
            <circle cx="50" cy="50" r="42" class="gauge-bg" />
            <circle
              cx="50"
              cy="50"
              r="42"
              class="gauge-progress"
              [style.strokeDashoffset]="gaugeDashoffset()"
              [attr.stroke]="gaugeStrokeColor()"
            />
          </svg>
          <div class="gauge-center-val">
            <span class="score-num num">{{ currentScore() }}</span>
            <span class="score-label">SCORE</span>
          </div>
        </div>

        <div class="preview-text">
          <div class="rec-badge-row">
            <span class="badge" [class.badge-primary]="currentScore() >= 75" [class.badge-amber]="currentScore() >= 55 && currentScore() < 75" [class.badge-coral]="currentScore() < 55">
              {{ readinessBadgeLabel() }}
            </span>
            <span class="readiness-status-tag">{{ readinessBandLabel() }}</span>
          </div>
          <p class="preview-reason">{{ recovery.readinessResult().reason }}</p>
          <div class="readiness-bars-micro">
            <div class="micro-track">
              <div class="micro-fill" [style.width.%]="currentScore()" [style.background]="gaugeStrokeColor()"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Check-in Action -->
      <div class="checkin-cta">
        <button class="btn btn-primary save-btn" (click)="saveCheckin()">
          <app-icon name="check" [size]="18" />
          <span>Save Check-in & Sync Workout Target ({{ currentScore() }} Readiness)</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .checkin-page {
      max-width: 860px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
    }
    .checkin-header {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
      font-size: var(--fs-xs);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.15s ease;
    }
    .back-link:hover {
      color: var(--primary);
    }
    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-3);
    }
    .title-row h2 {
      font-size: clamp(1.4rem, 2.5vw, 1.85rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text);
    }
    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 4px 10px;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 8px var(--primary);
      animation: pulseDot 1.6s infinite ease-in-out;
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
    }
    .header-sub {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      max-width: 680px;
    }

    /* Mood Selector */
    .mood-selector {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      padding: var(--s-4);
    }
    .section-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    .mood-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }
    .mood-btn {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 14px 8px;
      border-radius: var(--r-input);
      border: 1px solid var(--border);
      background: var(--surface-2);
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .mood-btn:hover {
      border-color: var(--border-strong);
      background: var(--surface-3);
      transform: translateY(-2px);
    }
    .mood-btn.selected {
      background: var(--primary-soft);
      border-color: var(--primary);
      color: var(--text);
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 20px -4px var(--primary-soft);
    }
    .mood-face {
      font-size: 1.8rem;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .mood-btn.selected .mood-face {
      transform: scale(1.15);
      animation: emojiPop 0.4s ease-out;
    }
    @keyframes emojiPop {
      0% { transform: scale(0.9); }
      50% { transform: scale(1.3); }
      100% { transform: scale(1.15); }
    }
    .mood-lbl {
      font-size: var(--fs-xs);
      font-weight: 700;
    }
    .active-indicator {
      position: absolute;
      bottom: 4px;
      width: 14px;
      height: 3px;
      border-radius: 2px;
      background: var(--primary);
      box-shadow: 0 0 6px var(--primary);
    }

    /* Signals 2x2 Grid */
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
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-card);
      transition: all 0.25s ease;
    }
    .signal-card:hover {
      border-color: var(--border-strong);
    }
    .signal-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }
    .sig-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sig-icon-wrap {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-2);
      border: 1px solid var(--border);
    }
    .sig-icon-wrap.moon { color: #818cf8; }
    .sig-icon-wrap.stress { color: #38bdf8; }
    .sig-icon-wrap.flame { color: #f97316; }
    .sig-icon-wrap.zap { color: var(--primary); }

    .sig-title {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .val-group {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }
    .sig-val {
      font-size: var(--fs-md);
      font-weight: 800;
      color: var(--text);
      line-height: 1;
    }
    .sig-quality-tag, .sig-stress-tag, .sig-soreness-tag, .sig-energy-tag {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .sig-quality-tag.optimal { color: #86efac; }
    .sig-quality-tag:not(.optimal) { color: #f59e0b; }
    .sig-stress-tag.low { color: #38bdf8; }
    .sig-stress-tag.med { color: #f59e0b; }
    .sig-stress-tag.high { color: #ef4444; }
    .sig-soreness-tag.low { color: #86efac; }
    .sig-soreness-tag.med { color: #f59e0b; }
    .sig-soreness-tag.high { color: #ef4444; }
    .sig-energy-tag.high { color: var(--primary); }
    .sig-energy-tag.med { color: #38bdf8; }
    .sig-energy-tag.low { color: #f59e0b; }

    /* 1. Sleep Hypnogram Bars */
    .hypnogram-wrap {
      position: relative;
      height: 54px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding-top: 6px;
    }
    .hypno-bars {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      height: 44px;
    }
    .hypno-bar-col {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      gap: 4px;
    }
    .hypno-bar-fill {
      width: 100%;
      border-radius: 4px 4px 0 0;
      background: var(--surface-3);
      transition: height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .hypno-bar-fill.deep {
      background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%);
      box-shadow: 0 0 10px rgba(129, 140, 248, 0.3);
    }
    .hypno-bar-fill.rem {
      background: linear-gradient(180deg, #38bdf8 0%, #0369a1 100%);
      box-shadow: 0 0 8px rgba(56, 189, 248, 0.25);
    }
    .hypno-bar-fill.light {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%);
    }
    .hypno-label {
      font-size: 0.6rem;
      color: var(--text-faint);
    }
    .hypno-ambient-line {
      width: 100%;
      height: 1px;
      background: var(--border);
      margin-top: 2px;
    }

    /* 2. Flowing Animated Biometrics Wave */
    .wave-graphic-container {
      position: relative;
      height: 54px;
      display: flex;
      align-items: center;
      overflow: hidden;
      background: rgba(11, 16, 21, 0.5);
      border-radius: var(--r-input);
      border: 1px solid var(--border);
      padding: 0 4px;
    }
    .wave-svg {
      width: 100%;
      height: 38px;
    }
    .flowing-path {
      animation: waveFlow 2.4s linear infinite;
    }
    @keyframes waveFlow {
      0% { stroke-dasharray: 6 3; stroke-dashoffset: 0; }
      100% { stroke-dasharray: 6 3; stroke-dashoffset: -36; }
    }
    .wave-pulse-glow {
      position: absolute;
      right: 12px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      box-shadow: 0 0 14px 4px currentColor;
      animation: heartGlow 1.4s infinite ease-in-out;
    }
    @keyframes heartGlow {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.6); opacity: 0.3; }
    }

    /* 3. 10-Segment Muscle Soreness Heatmap */
    .soreness-meter {
      height: 54px;
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(11, 16, 21, 0.5);
      border-radius: var(--r-input);
      border: 1px solid var(--border);
      padding: 0 8px;
    }
    .soreness-bar {
      flex: 1;
      height: 24px;
      border-radius: 3px;
      background: var(--surface-2);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .soreness-bar.active {
      height: 34px;
    }
    .soreness-bar.active.mild-bar {
      background: linear-gradient(180deg, #86efac 0%, #22c55e 100%);
      box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
    }
    .soreness-bar.active.med-bar {
      background: linear-gradient(180deg, #fde047 0%, #f59e0b 100%);
      box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
    }
    .soreness-bar.active.severe-bar {
      background: linear-gradient(180deg, #f87171 0%, #ef4444 100%);
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
      animation: severeHeat 1.2s infinite alternate ease-in-out;
    }
    @keyframes severeHeat {
      from { filter: brightness(1); }
      to { filter: brightness(1.3); }
    }

    /* 4. Kinetic Energy Equalizer */
    .energy-equalizer {
      height: 54px;
      display: flex;
      align-items: flex-end;
      gap: 5px;
      background: rgba(11, 16, 21, 0.5);
      border-radius: var(--r-input);
      border: 1px solid var(--border);
      padding: 0 8px 6px 8px;
    }
    .eq-bar {
      flex: 1;
      border-radius: 3px 3px 0 0;
      background: var(--surface-2);
      transition: height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease;
    }
    .eq-bar.active {
      background: linear-gradient(180deg, #ecfccb 0%, var(--primary) 100%);
      box-shadow: 0 0 10px var(--primary-soft);
    }
    .eq-bar.pulse-active {
      animation: eqBounce 1.4s infinite alternate ease-in-out;
    }
    @keyframes eqBounce {
      0% { filter: brightness(0.95); transform: scaleY(0.95); }
      100% { filter: brightness(1.2); transform: scaleY(1.05); }
    }

    /* Steppers */
    .slider-stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      padding-top: 10px;
      margin-top: 2px;
    }
    .step-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      font-weight: 800;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .step-btn:hover {
      color: var(--text);
      border-color: var(--primary);
      background: var(--surface-3);
      transform: scale(1.08);
    }
    .stepper-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
    }
    .step-metric {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text);
    }
    .step-hint {
      font-size: 0.65rem;
      color: var(--text-faint);
    }

    /* Calculated Readiness HUD Card */
    .calculated-preview {
      display: flex;
      align-items: center;
      gap: var(--s-5);
      padding: var(--s-4) var(--s-5);
      background: linear-gradient(180deg, var(--surface) 0%, var(--surface-2) 100%);
      border: 1px solid var(--primary-line);
      border-radius: var(--r-card);
      box-shadow: 0 0 25px -4px var(--primary-soft);
    }
    .preview-gauge-wrap {
      position: relative;
      width: 84px;
      height: 84px;
      flex: 0 0 84px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .radial-gauge-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .gauge-bg {
      fill: none;
      stroke: var(--surface-3);
      stroke-width: 8;
    }
    .gauge-progress {
      fill: none;
      stroke-width: 8;
      stroke-linecap: round;
      stroke-dasharray: 264;
      transition: stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.3s ease;
      filter: drop-shadow(0 0 6px currentColor);
    }
    .gauge-center-val {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .score-num {
      font-family: var(--font-display);
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text);
      line-height: 1;
    }
    .score-label {
      font-size: 0.58rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }

    .preview-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .rec-badge-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge-amber {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.4);
    }
    .badge-coral {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.4);
    }
    .readiness-status-tag {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted);
    }
    .preview-reason {
      font-size: var(--fs-xs);
      color: var(--text);
      line-height: 1.4;
    }
    .readiness-bars-micro {
      width: 100%;
      margin-top: 4px;
    }
    .micro-track {
      width: 100%;
      height: 5px;
      background: var(--surface-3);
      border-radius: var(--r-pill);
      overflow: hidden;
    }
    .micro-fill {
      height: 100%;
      border-radius: var(--r-pill);
      transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .save-btn {
      width: 100%;
      padding: 16px;
      font-size: var(--fs-md);
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 20px var(--primary-soft);
      transition: all 0.2s ease;
    }
    .save-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px var(--primary-soft);
    }

    @media (max-width: 680px) {
      .signals-grid {
        grid-template-columns: 1fr;
      }
      .mood-grid {
        grid-template-columns: repeat(5, 1fr);
      }
      .calculated-preview {
        flex-direction: column;
        text-align: center;
      }
      .rec-badge-row {
        justify-content: center;
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

  currentScore = computed(() => this.recovery.readinessResult().score ?? 85);

  formatSleepHours(hours: number): string {
    const whole = Math.floor(hours);
    const mins = Math.round((hours - whole) * 60);
    return `${whole}h ${mins.toString().padStart(2, '0')}m`;
  }

  sleepQualityLabel = computed(() => {
    const h = this.recovery.checkin().sleepHours;
    if (h >= 8) return 'Optimal Deep Sleep';
    if (h >= 7) return 'Good Recovery';
    if (h >= 6) return 'Mild Sleep Debt';
    return 'Severe Deprivation';
  });

  sleepBars = computed(() => {
    const h = this.recovery.checkin().sleepHours;
    const factor = Math.min(1.2, h / 8);
    return [
      { id: 1, label: 'Deep 1', height: Math.min(100, Math.round(85 * factor)), type: 'deep' },
      { id: 2, label: 'REM 1', height: Math.min(100, Math.round(65 * factor)), type: 'rem' },
      { id: 3, label: 'Light', height: Math.min(100, Math.round(45 * factor)), type: 'light' },
      { id: 4, label: 'Deep 2', height: Math.min(100, Math.round(92 * factor)), type: 'deep' },
      { id: 5, label: 'REM 2', height: Math.min(100, Math.round(75 * factor)), type: 'rem' },
      { id: 6, label: 'Light', height: Math.min(100, Math.round(50 * factor)), type: 'light' }
    ];
  });

  stressLabel = computed(() => {
    const s = this.recovery.checkin().stressLevel;
    if (s <= 2) return 'Parasympathetic Calm';
    if (s <= 4) return 'Low Stress';
    if (s <= 6) return 'Moderate Tension';
    if (s <= 8) return 'Elevated Cortisol';
    return 'Sympathetic Overload';
  });

  dynamicWavePath = computed(() => {
    const s = this.recovery.checkin().stressLevel;
    // Compute dynamic amplitude and frequency
    const amp = 5 + (s * 1.5); // 6.5 to 20
    const mid = 20;
    const p1 = mid - amp;
    const p2 = mid + amp;
    return `M0,${mid} Q30,${p1} 60,${mid} T120,${mid} T180,${mid} T240,${mid}`;
  });

  waveSpeed = computed(() => {
    const s = this.recovery.checkin().stressLevel;
    if (s <= 3) return '3.2s';
    if (s <= 6) return '2.2s';
    return '1.2s';
  });

  waveStartColor = computed(() => {
    const s = this.recovery.checkin().stressLevel;
    if (s <= 3) return '#38bdf8';
    if (s <= 6) return '#f59e0b';
    return '#ef4444';
  });

  waveEndColor = computed(() => {
    const s = this.recovery.checkin().stressLevel;
    if (s <= 3) return '#818cf8';
    if (s <= 6) return '#fbbf24';
    return '#f87171';
  });

  wavePulseColor = computed(() => this.waveStartColor());

  sorenessLabel = computed(() => {
    const l = this.recovery.checkin().sorenessLevel;
    if (l <= 1) return 'Rested & Fresh';
    if (l <= 3) return 'Slight Fatigue';
    if (l <= 5) return 'Moderate Stiffness';
    if (l <= 7) return 'Heavy DOMS';
    return 'Acute Inflammation';
  });

  energyLabel = computed(() => {
    const e = this.recovery.checkin().energyLevel;
    if (e >= 9) return 'Peak Athletic Drive';
    if (e >= 7) return 'High Vitality';
    if (e >= 5) return 'Normal Baseline';
    if (e >= 3) return 'Lethargic';
    return 'Severe Exhaustion';
  });

  getEqualizerHeight(barIndex: number): number {
    const e = this.recovery.checkin().energyLevel;
    if (e < barIndex) return 20;
    // Active oscillating height pattern
    const pattern = [55, 80, 65, 95, 75, 90, 70, 85, 100, 80];
    return pattern[(barIndex - 1) % pattern.length];
  }

  gaugeDashoffset = computed(() => {
    const circumference = 264;
    const pct = Math.max(0, Math.min(100, this.currentScore()));
    return circumference - (circumference * pct) / 100;
  });

  gaugeStrokeColor = computed(() => {
    const s = this.currentScore();
    if (s >= 75) return '#ccff00';
    if (s >= 55) return '#38bdf8';
    return '#ef4444';
  });

  readinessBadgeLabel = computed(() => {
    const rec = this.recovery.readinessResult().recommendation;
    if (rec === 'train') return 'PRIME TO TRAIN';
    if (rec === 'lighten') return 'LIGHTEN WORKLOAD';
    if (rec === 'mobility') return 'MOBILITY FOCUS';
    return 'ACTIVE RECOVERY';
  });

  readinessBandLabel = computed(() => {
    const band = this.recovery.readinessResult().band;
    if (band === 'good') return 'High Readiness';
    if (band === 'moderate') return 'Moderate Load';
    return 'Deload Advised';
  });

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
    const score = this.currentScore();
    this.user.profile.update(p => ({ ...p, readiness: score }));
    alert(`Check-in saved! Your new readiness score is ${score}/100.`);
    this.router.navigate(['/overview']);
  }
}
