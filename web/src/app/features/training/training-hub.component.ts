import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { WorkoutService, ExerciseItem, CompletedSessionItem, LoggedExerciseItem } from '../../core/services/workout.service';
import { NutritionService } from '../../core/services/nutrition.service';
import { ExerciseModalComponent } from '../../shared/ui/exercise-modal/exercise-modal.component';
import { MuscleAnatomyComponent } from '../../shared/ui/muscle-anatomy/muscle-anatomy.component';

interface CalendarDay {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasWorkouts: boolean;
  workoutCount: number;
  hasPlanned?: boolean;
  plannedCount?: number;
  totalVolumeKg: number;
  hasMeals: boolean;
  mealCount: number;
  totalKcal: number;
  waterGlasses: number;
}

export interface RoutineItem {
  id: string;
  name: string;
  muscle: string;
  secondaryMuscles?: string[];
  targetSets: number;
  targetReps: number;
  targetWeightKg?: number;
  image?: string;
  isSuperset?: boolean;
  isBodyweight?: boolean;
  repsPerSide?: boolean;
  addedWeightKg?: number;
  topOfRange?: number;
  intensifier?: string;
  progressionRule?: string;
  stepKg?: number;
  notes?: string;
}

@Component({
  selector: 'app-training-hub',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe, UpperCasePipe, IconComponent, ExerciseModalComponent, MuscleAnatomyComponent],
  template: `
    <div class="training-hub">
      <!-- Just Finished Celebration Banner -->
      @if (showJustFinishedBanner()) {
        <div class="just-finished-alert card">
          <div class="alert-left">
            <span class="alert-icon">🏆</span>
            <div>
              <h3 class="alert-title">Workout Recorded & Synchronized!</h3>
              <p class="alert-sub">Your sets, reps, and tonnage have been saved to your training history below.</p>
            </div>
          </div>
          <button class="close-alert-btn" (click)="showJustFinishedBanner.set(false)" title="Dismiss">
            <app-icon name="close" [size]="16" />
          </button>
        </div>
      }

      <!-- Top Primary Tab Switcher -->
      <nav class="hub-tabs-nav">
        <button
          class="hub-tab-btn"
          [class.active]="activeTab() === 'calendar'"
          (click)="activeTab.set('calendar')"
        >
          <app-icon name="calendar" [size]="18" />
          <span>Workout Calendar & History</span>
        </button>
        <button
          class="hub-tab-btn highlight-tab"
          [class.active]="activeTab() === 'routine'"
          (click)="activeTab.set('routine')"
        >
          <app-icon name="zap" [size]="18" />
          <span>Routine & Muscle Heatmap</span>
          <span class="routine-tab-badge">ANATOMY</span>
        </button>
        <button
          class="hub-tab-btn"
          [class.active]="activeTab() === 'library'"
          (click)="activeTab.set('library')"
        >
          <app-icon name="barbell" [size]="18" />
          <span>Exercise & Movement Library</span>
          <span class="lib-count-badge">{{ workout.exerciseLibrary().length }}</span>
        </button>
      </nav>

      <!-- TAB 1: WORKOUT CALENDAR & HISTORY -->
      @if (activeTab() === 'calendar') {
        <div class="calendar-history-view">
          @if (showAddedToast()) {
            <div class="added-toast-banner card">
              <div class="toast-left">
                <app-icon name="check" [size]="18" />
                <span class="toast-msg">{{ showAddedToast() }}</span>
              </div>
              <a routerLink="/training/session/live" class="btn btn-primary btn-sm">
                <span>Start Live Workout Now →</span>
              </a>
            </div>
          }

          <!-- Athlete Level & Achievements Showcase Ribbon -->
          <section class="athlete-level-ribbon card">
            <div class="ribbon-main">
              <!-- Left: Rank & XP -->
              <div class="athlete-rank-col">
                <div class="rank-shield">
                  <span class="shield-lvl">LVL</span>
                  <span class="shield-num">{{ athleteLevel() }}</span>
                </div>
                <div class="rank-details">
                  <div class="rank-title-row">
                    <h3 class="rank-title">TITAN ATHLETE · DIV I</h3>
                    <span class="streak-badge">🔥 {{ activeStreakDays() }}-Day Streak (1.5× XP)</span>
                  </div>
                  <div class="xp-bar-wrap">
                    <div class="xp-bar-track">
                      <div class="xp-bar-fill" [style.width.%]="(athleteXp() / nextLevelXp()) * 100"></div>
                    </div>
                    <div class="xp-text-row">
                      <span>{{ athleteXp() | number }} / {{ nextLevelXp() | number }} XP</span>
                      <span class="xp-left">{{ nextLevelXp() - athleteXp() }} XP to Level {{ athleteLevel() + 1 }} Master Titan</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: 4 Unlocked Achievement Medals -->
              <div class="achievements-col">
                <div class="achieve-col-head">
                  <span class="achieve-lbl">ACCOLADES & BADGES ({{ achievements().length - 1 }} UNLOCKED)</span>
                  <span class="achieve-hint">Click badge to view milestone</span>
                </div>
                <div class="badges-row">
                  @for (badge of achievements(); track badge.id) {
                    <button
                      type="button"
                      class="medal-badge-btn"
                      [class.unlocked]="badge.unlocked"
                      [class.locked]="!badge.unlocked"
                      [class.is-active]="selectedAchievement()?.id === badge.id"
                      (click)="selectedAchievement.set(selectedAchievement()?.id === badge.id ? null : badge)"
                      [title]="badge.title + ': ' + badge.desc"
                    >
                      <span class="badge-icon">{{ badge.icon }}</span>
                      <div class="badge-info">
                        <span class="badge-name">{{ badge.title }}</span>
                        <span class="badge-stat">{{ badge.stat }}</span>
                      </div>
                      <span class="badge-xp-tag">{{ badge.xp }}</span>
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Achievement Detail Popover Drawer -->
            @if (selectedAchievement()) {
              <div class="achievement-inspect-drawer animated-fade-in">
                <div class="aid-left">
                  <span class="aid-icon">{{ selectedAchievement().icon }}</span>
                  <div>
                    <div class="aid-title-row">
                      <h4>{{ selectedAchievement().title }}</h4>
                      <span class="badge-xp-tag">{{ selectedAchievement().xp }}</span>
                      <span class="aid-status" [class.unlocked]="selectedAchievement().unlocked">
                        {{ selectedAchievement().unlocked ? '✓ Unlocked' : '⏳ In Progress' }}
                      </span>
                    </div>
                    <p class="aid-desc">{{ selectedAchievement().desc }}</p>
                    <span class="aid-date">{{ selectedAchievement().date }} · Benchmark: {{ selectedAchievement().stat }}</span>
                  </div>
                </div>
                <button type="button" class="close-drawer-btn" (click)="selectedAchievement.set(null)">✕</button>
              </div>
            }

            <!-- Active Program Switcher Selector Strip -->
            <div class="program-switcher-strip">
              <div class="prog-label-row">
                <span class="prog-tag">ACTIVE MACROCYCLE:</span>
                <span class="prog-active-name">{{ activeProgram() }}</span>
              </div>
              <div class="prog-pills-row">
                @for (p of trainingPrograms; track p.id) {
                  <button
                    type="button"
                    class="prog-pill-btn"
                    [class.active]="activeProgram() === p.name"
                    (click)="switchProgram(p.name)"
                  >
                    <span class="p-days">{{ p.daysPerWeek }}D</span>
                    <span class="p-name">{{ p.name }}</span>
                  </button>
                }
              </div>
            </div>
          </section>

          <!-- Interactive Quick-Start Guide Bar (User Friendly) -->
          <section class="quick-guide-strip card">
            <div class="qg-top">
              <div class="qg-title-row">
                <span class="qg-badge">✨ HOW TO USE APEX TRAINING</span>
                <span class="qg-subtitle">3 simple steps to execute, track, and master your athletic progress</span>
              </div>
              <button type="button" class="qg-toggle-btn" (click)="showGuide.set(!showGuide())">
                {{ showGuide() ? 'Hide Guide ▴' : 'Show Guide ▾' }}
              </button>
            </div>

            @if (showGuide()) {
              <div class="qg-steps-grid animated-fade-in">
                <div class="qg-step-card">
                  <div class="qg-step-num">01</div>
                  <div class="qg-step-content">
                    <h5>📅 Pick & Inspect Any Date</h5>
                    <p>Click any day on the calendar below to see past workouts, calories, and water logs.</p>
                  </div>
                </div>
                <div class="qg-step-card highlight">
                  <div class="qg-step-num">02</div>
                  <div class="qg-step-content">
                    <h5>⚡ Start Live Session</h5>
                    <p>Click "Start Live Workout" for real-time 3D skeletal tracking and guided rep cadence.</p>
                  </div>
                </div>
                <div class="qg-step-card">
                  <div class="qg-step-num">03</div>
                  <div class="qg-step-content">
                    <h5>📊 Auto-Saved History & PRs</h5>
                    <p>Every set and tonnage auto-saves into history and resets cleanly every midnight.</p>
                  </div>
                </div>
              </div>
            }
          </section>

          <!-- Dynamic Session Banner & Movements Deck for Selected Date -->
          <section class="session-banner card">
            <div class="banner-top-row">
              <div class="banner-left">
                <div class="banner-badge-row">
                  <span
                    class="badge"
                    [class.badge-accent]="primarySession() ? primarySession()!.isCompleted !== false : isSelectedDayCompleted()"
                    [class.badge-primary]="primarySession() ? primarySession()!.isCompleted === false : (isSelectedDateToday() && !isSelectedDayCompleted())"
                    [class.badge-scheduled]="isSelectedDateFuture() && !isSelectedDayCompleted()"
                    [class.badge-muted]="isSelectedDatePast() && !isSelectedDayCompleted()"
                  >
                    {{ bannerBadge() }}
                  </span>
                  @if (!isSelectedDateToday()) {
                    <button class="jump-today-btn" (click)="jumpToToday()" title="Return to today's active schedule">
                      Jump to Today ↩
                    </button>
                  }
                </div>
                <h2>{{ bannerTitle() }}</h2>
                <p>{{ bannerSubtitle() }}</p>
              </div>
              <div class="banner-right">
                @if (primarySession(); as sess) {
                  @if (sess.isCompleted === false) {
                    <!-- Session is Planned / Ready to start -->
                    <button class="btn btn-primary start-btn" (click)="startSessionLive(sess)">
                      <app-icon name="play" [size]="16" />
                      <span>Start Live Workout →</span>
                    </button>
                    <button class="btn btn-outline" (click)="toggleSessionCompletion(sess.id)" title="Quickly mark this session as completed">
                      ✓ Mark Completed
                    </button>
                    <button class="btn btn-secondary" (click)="openAddModal(selectedDateStr())">
                      + Add Another Session
                    </button>
                    <button class="btn-delete-ghost" (click)="deleteSession(sess.id)" title="Delete this session">
                      ✕ Delete
                    </button>
                  } @else {
                    <!-- Session is Completed -->
                    <button class="btn btn-outline" (click)="inspectorTab.set('workouts')">
                      View Log Below ↓
                    </button>
                    <button class="btn btn-secondary" (click)="openAddModal(selectedDateStr())">
                      + Log Another Session
                    </button>
                    <button class="btn-reopen" (click)="toggleSessionCompletion(sess.id)" title="Reopen session and set status to Ready to Start">
                      ↩ Mark as Incomplete (Ready to Start)
                    </button>
                    <button class="btn-delete-ghost" (click)="deleteSession(sess.id)" title="Delete this session">
                      ✕ Delete
                    </button>
                  }
                } @else {
                  <!-- No sessions recorded for this day yet -->
                  @if (isSelectedDateToday()) {
                    <button class="btn btn-secondary" (click)="openAddModal(todayStr)">
                      + Plan / Log Session
                    </button>
                    <a routerLink="/training/session/live" class="btn btn-primary start-btn">
                      <app-icon name="play" [size]="16" />
                      <span>Start Live Workout →</span>
                    </a>
                  } @else {
                    <button class="btn btn-outline" (click)="jumpToToday()">
                      Jump to Today ↩
                    </button>
                    <button class="btn btn-secondary" (click)="openAddModal(selectedDateStr())">
                      + Plan / Log Session for {{ isTomorrow() ? 'Tomorrow' : (isSelectedDateFuture() ? 'Upcoming Day' : 'This Day') }}
                    </button>
                  }
                }
              </div>
            </div>

            <!-- Dynamic Movements Deck for Selected Date -->
            <div class="banner-exercises-grid">
              @for (ex of activeExercisesDeck(); track ex.num + ex.name) {
                <div class="banner-ex-item" [class.is-completed]="ex.isCompleted">
                  <div class="b-ex-top-meta">
                    <span class="b-ex-num">{{ ex.num }}</span>
                    <span class="b-ex-muscle">{{ ex.muscle }}</span>
                  </div>
                  <div class="b-ex-name">{{ ex.name }}</div>
                  <div class="b-ex-meta">{{ ex.meta }}</div>
                  <div class="b-ex-status">
                    <span
                      class="status-pill"
                      [class.status-done]="ex.isCompleted"
                      [class.status-ready]="!ex.isCompleted && isSelectedDateToday()"
                      [class.status-scheduled]="!ex.isCompleted && isSelectedDateFuture()"
                      [class.status-rest]="!ex.isCompleted && isSelectedDatePast()"
                    >
                      {{ ex.statusText }}
                    </span>
                  </div>
                </div>
              }
            </div>

            <!-- Session Biomechanical Muscle Anatomy Heatmap -->
            <div class="sess-anatomy-strip">
              <div class="sess-anatomy-head">
                <div class="sess-anatomy-title-block">
                  <span class="sess-anatomy-tag">✨ WHAT THIS SESSION HITS</span>
                  <span class="sess-anatomy-sub">Active muscle recruitment for {{ bannerTitle() }}</span>
                </div>
                <button type="button" class="btn btn-outline btn-sm configure-routine-btn" (click)="activeTab.set('routine')">
                  <app-icon name="sliders" [size]="14" />
                  <span>Customize Routine & Supersets ↗</span>
                </button>
              </div>
              <app-muscle-anatomy [muscles]="sessionTargetMuscles()" [compact]="true" />
            </div>
          </section>

          <!-- Interactive UI Calendar & Selected Day Inspector Split -->
          <div class="calendar-inspector-split">
            <!-- Calendar Card -->
            <div class="calendar-card card">
              <div class="calendar-header">
                <div class="cal-title-wrap">
                  <h3 class="cal-month-title">{{ currentMonthName() }} {{ currentYear() }}</h3>
                  <span class="cal-subtitle">Click any date to inspect workout logs</span>
                </div>
                <div class="cal-nav-buttons">
                  <button class="cal-btn" (click)="prevMonth()" title="Previous Month">←</button>
                  <button class="cal-btn today-jump-btn" (click)="jumpToToday()">Today</button>
                  <button class="cal-btn" (click)="nextMonth()" title="Next Month">→</button>
                </div>
              </div>

              <!-- Weekday Header -->
              <div class="weekdays-grid">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              <!-- Days Grid -->
              <div class="days-grid">
                @for (day of calendarDays(); track day.dateStr) {
                  <button
                    class="day-cell"
                    [class.other-month]="!day.isCurrentMonth"
                    [class.is-today]="day.isToday"
                    [class.is-selected]="selectedDateStr() === day.dateStr"
                    [class.has-workout]="day.hasWorkouts"
                    [class.has-planned]="day.hasPlanned"
                    (click)="selectDate(day.dateStr)"
                  >
                    <span class="day-num">{{ day.dayNumber }}</span>
                    <div class="day-micro-pills">
                      @if (day.hasWorkouts) {
                        <span class="day-workout-pill" title="Workout Logged">
                          <span class="workout-dot"></span>
                          <span class="workout-vol-txt">{{ (day.totalVolumeKg / 1000) | number:'1.1-1' }}t</span>
                        </span>
                      } @else if (day.hasPlanned) {
                        <span class="day-planned-pill" title="Workout Scheduled">
                          <span class="planned-dot">⚡</span>
                          <span class="workout-vol-txt">Plan</span>
                        </span>
                      }
                      <div class="day-dots-group">
                        @if (day.hasMeals) {
                          <span class="day-meal-micro-dot" [title]="day.mealCount + ' Meals (' + day.totalKcal + ' kcal)'"></span>
                        }
                        @if (day.waterGlasses > 0) {
                          <span class="day-water-micro-dot" [title]="day.waterGlasses + ' Water Glasses'"></span>
                        }
                      </div>
                    </div>
                  </button>
                }
              </div>

              <!-- Calendar Legend -->
              <div class="cal-legend">
                <div class="legend-item">
                  <span class="legend-dot today-dot"></span>
                  <span>Today</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot workout-dot-sample"></span>
                  <span>Workout</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot meal-dot-sample"></span>
                  <span>Meals</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot water-dot-sample"></span>
                  <span>Water</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot selected-dot-sample"></span>
                  <span>Selected</span>
                </div>
              </div>
            </div>

            <!-- Day Inspector: Detailed Workouts, Meals, and Water for Selected Date -->
            <div class="inspector-card card">
              <div class="inspector-header">
                <div>
                  <div class="inspector-tags-row">
                    <span class="inspector-badge">DAILY INTELLIGENCE</span>
                    <span
                      class="status-day-pill"
                      [class.live-pill]="isSelectedDateToday()"
                      [class.future-pill]="isSelectedDateFuture()"
                    >
                      {{ selectedDayStatusLabel() }}
                    </span>
                  </div>
                  <h3 class="inspector-date-title">{{ formattedSelectedDate() }}</h3>
                  <span class="inspector-hint">Selected day log. Click any date on the calendar to switch days.</span>
                </div>
                <div class="inspector-actions-top">
                  <button class="btn btn-secondary add-day-btn" (click)="openAddModal(selectedDateStr())">
                    + Log Workout
                  </button>
                </div>
              </div>

              <!-- Category Filter Tabs -->
              <div class="inspector-filter-nav">
                <button
                  class="insp-tab-btn"
                  [class.active]="inspectorTab() === 'all'"
                  (click)="inspectorTab.set('all')"
                >
                  ⚡ All Activity
                </button>
                <button
                  class="insp-tab-btn"
                  [class.active]="inspectorTab() === 'workouts'"
                  (click)="inspectorTab.set('workouts')"
                >
                  🏋️ Workouts ({{ selectedDaySessions().length }})
                </button>
                <button
                  class="insp-tab-btn"
                  [class.active]="inspectorTab() === 'meals'"
                  (click)="inspectorTab.set('meals')"
                >
                  🥗 Meals ({{ selectedDayMeals().length }})
                </button>
                <button
                  class="insp-tab-btn"
                  [class.active]="inspectorTab() === 'water'"
                  (click)="inspectorTab.set('water')"
                >
                  💧 Water ({{ selectedDayWater() }}/8)
                </button>
              </div>

              <!-- Animated 3-KPI Status Strip -->
              <div class="inspector-kpi-deck">
                <div class="insp-kpi-card workout-kpi" [class.has-data]="selectedDaySessions().length > 0">
                  <div class="kpi-top-lbl">
                    <span class="kpi-icon">🏋️</span>
                    <span>Workout Volume</span>
                  </div>
                  <div class="kpi-val num">
                    {{ selectedDaySessions().length > 0 ? ((selectedDayVolume() | number) + ' kg') : 'Rest Day' }}
                  </div>
                  <div class="kpi-sub">
                    {{ selectedDaySessions().length > 0 ? (selectedDaySets() + ' sets done across ' + selectedDaySessions().length + (selectedDaySessions().length === 1 ? ' session' : ' sessions')) : 'Recovery & supercompensation' }}
                  </div>
                </div>

                <div class="insp-kpi-card meals-kpi" [class.has-data]="selectedDayMeals().length > 0">
                  <div class="kpi-top-lbl">
                    <span class="kpi-icon">🥗</span>
                    <span>Nutrition</span>
                  </div>
                  <div class="kpi-val num">{{ selectedDayNutrients().kcal | number }} kcal</div>
                  <div class="kpi-sub">
                    @if (selectedDayMeals().length > 0) {
                      {{ selectedDayMeals().length }} {{ selectedDayMeals().length === 1 ? 'meal' : 'meals' }} tracked
                    } @else {
                      <a routerLink="/nutrition/scan" class="kpi-action-link">+ Scan or log meal</a>
                    }
                  </div>
                </div>

                <div class="insp-kpi-card water-kpi" [class.has-data]="selectedDayWater() > 0">
                  <div class="kpi-top-lbl">
                    <span class="kpi-icon">💧</span>
                    <span>Hydration</span>
                  </div>
                  <div class="kpi-val-row">
                    <div class="kpi-val num">{{ selectedDayWater() }} / 8</div>
                    <div class="kpi-water-micro-btns">
                      <button type="button" class="micro-btn" (click)="adjustSelectedDayWater(-1)" [disabled]="selectedDayWater() <= 0" title="Remove glass">−</button>
                      <button type="button" class="micro-btn plus" (click)="adjustSelectedDayWater(1)" title="Add glass">+</button>
                    </div>
                  </div>
                  <div class="kpi-sub">{{ selectedDayWater() * 250 }} ml logged</div>
                </div>
              </div>

              <div class="inspector-content">
                <!-- 1. WORKOUTS SECTION -->
                @if (inspectorTab() === 'all' || inspectorTab() === 'workouts') {
                  <div class="insp-section-block animated-fade-in">
                    <div class="section-sub-header">
                      <span class="section-icon">🏋️</span>
                      <h4>Training Sessions</h4>
                      <span class="section-count">{{ selectedDaySessions().length }}</span>
                    </div>

                    @if (selectedDaySessions().length > 0) {
                      <div class="sessions-stack">
                        @for (sess of selectedDaySessions(); track sess.id) {
                          <div class="logged-session-card">
                            <div class="sess-card-top">
                              <div class="sess-info-left">
                                <div class="sess-title-wrap">
                                  <span class="sess-icon">{{ sess.isCompleted === false ? '⚡' : '✓' }}</span>
                                  <h4 class="sess-title">{{ sess.title }}</h4>
                                  <span class="badge" [class.badge-accent]="sess.isCompleted !== false" [class.badge-primary]="sess.isCompleted === false">
                                    {{ sess.isCompleted === false ? 'Scheduled · Ready' : 'Completed' }}
                                  </span>
                                </div>
                                <span class="sess-time">{{ sess.completedAt }}</span>
                              </div>
                              <div class="sess-card-actions">
                                @if (sess.isCompleted === false) {
                                  <button class="btn btn-primary btn-sm" (click)="startSessionLive(sess)">
                                    ⚡ Start Live
                                  </button>
                                  <button class="btn btn-outline btn-sm" (click)="toggleSessionCompletion(sess.id)">
                                    ✓ Complete
                                  </button>
                                } @else {
                                  <button class="btn-reopen-sm" (click)="toggleSessionCompletion(sess.id)" title="Switch status to uncompleted/ready to train">
                                    ↩ Mark Incomplete
                                  </button>
                                }
                                <button class="delete-sess-btn" (click)="deleteSession(sess.id)" title="Delete session log">
                                  <app-icon name="close" [size]="14" />
                                </button>
                              </div>
                            </div>

                            <!-- Prominent 3-Stat Ribbon -->
                            <div class="sess-metrics-row">
                              @if (sess.isCompleted === false) {
                                <div class="metric-pill">
                                  <span class="m-lbl">STATUS</span>
                                  <span class="m-val num text-primary">Ready to Start ⚡</span>
                                </div>
                                <div class="metric-pill">
                                  <span class="m-lbl">PLANNED MOVEMENTS</span>
                                  <span class="m-val num text-accent">{{ sess.exercisesCount || sess.exercises?.length || 4 }} exercises</span>
                                </div>
                                <div class="metric-pill">
                                  <span class="m-lbl">EST. DURATION</span>
                                  <span class="m-val num">{{ sess.durationMinutes }}m</span>
                                </div>
                              } @else {
                                <div class="metric-pill">
                                  <span class="m-lbl">TONNAGE LIFTED</span>
                                  <span class="m-val num text-accent">{{ sess.totalVolumeKg | number }} kg</span>
                                </div>
                                <div class="metric-pill">
                                  <span class="m-lbl">TOTAL SETS</span>
                                  <span class="m-val num text-primary">{{ sess.totalSets }} sets</span>
                                </div>
                                <div class="metric-pill">
                                  <span class="m-lbl">DURATION</span>
                                  <span class="m-val num">{{ sess.durationMinutes }}m</span>
                                </div>
                              }
                            </div>

                            <!-- Exercises and Sets Detailed Breakdown -->
                            @if (sess.exercises && sess.exercises.length > 0) {
                              <div class="sess-exercises-detail">
                                <div class="detail-label-row">
                                  <span class="detail-label">LOGGED MOVEMENTS ({{ sess.exercises.length }} EXERCISES)</span>
                                </div>
                                @for (ex of sess.exercises; track ex.exerciseId) {
                                  <div class="ex-detail-item">
                                    <div class="ex-detail-title-row">
                                      <div class="ex-left-meta">
                                        <span class="ex-bullet">▶</span>
                                        <span class="ex-title-txt">{{ ex.exerciseName }}</span>
                                        <span class="ex-muscle-tag">{{ ex.muscle }}</span>
                                      </div>
                                      <button type="button" class="form-preview-btn" (click)="inspectExerciseByName(ex.exerciseName)" title="Inspect 3D Form & Skeletal Tracking">
                                        <span>👁️ 3D Form</span>
                                      </button>
                                    </div>
                                    <div class="sets-chips-wrap">
                                      @for (s of ex.sets; track s.setNumber) {
                                        <span class="set-chip" [class.pr-chip]="s.isPr" [class.warm-chip]="s.isWarmup">
                                          @if (s.isWarmup) {
                                            <span class="chip-type-tag warm">Warmup</span>
                                          } @else if (s.isPr) {
                                            <span class="chip-type-tag pr">★ PR</span>
                                          } @else {
                                            <span class="chip-type-tag">Set {{ s.setNumber }}</span>
                                          }
                                          <span class="chip-metric"><strong>{{ s.weightKg }}kg</strong> × {{ s.reps }} reps</span>
                                        </span>
                                      }
                                    </div>
                                  </div>
                                }
                              </div>
                            }
                          </div>
                        }
                      </div>
                    } @else {
                      <div class="empty-day-state">
                        <div class="empty-icon">🧘</div>
                        <h4>Active Recovery / Rest Day</h4>
                        <p>No workouts recorded on this date. Physiological repair and supercompensation active.</p>
                        <button class="btn btn-secondary btn-sm" (click)="openAddModal(selectedDateStr())">
                          + Log Workout for {{ formattedSelectedDate() }}
                        </button>
                      </div>
                    }
                  </div>
                }

                <!-- 2. MEALS & NUTRITION SECTION -->
                @if (inspectorTab() === 'all' || inspectorTab() === 'meals') {
                  <div class="insp-section-block animated-fade-in">
                    <div class="section-sub-header">
                      <span class="section-icon">🥗</span>
                      <h4>Nutrition & Meals Tracked</h4>
                      <span class="section-count">{{ selectedDayMeals().length }}</span>
                    </div>

                    <!-- Macro Breakdown Card -->
                    <div class="macro-breakdown-card">
                      <div class="macro-row">
                        <div class="macro-chip">
                          <span class="macro-name">Calories</span>
                          <span class="macro-val num">{{ selectedDayNutrients().kcal }} / 2,400</span>
                        </div>
                        <div class="macro-chip">
                          <span class="macro-dot" style="background: var(--macro-protein)"></span>
                          <span class="macro-name">Protein</span>
                          <span class="macro-val num">{{ selectedDayNutrients().protein }}g</span>
                        </div>
                        <div class="macro-chip">
                          <span class="macro-dot" style="background: var(--macro-carbs)"></span>
                          <span class="macro-name">Carbs</span>
                          <span class="macro-val num">{{ selectedDayNutrients().carbs }}g</span>
                        </div>
                        <div class="macro-chip">
                          <span class="macro-dot" style="background: var(--macro-fat)"></span>
                          <span class="macro-name">Fats</span>
                          <span class="macro-val num">{{ selectedDayNutrients().fat }}g</span>
                        </div>
                      </div>
                    </div>

                    @if (selectedDayMeals().length > 0) {
                      <div class="inspector-meals-list">
                        @for (meal of selectedDayMeals(); track meal.id) {
                          <div class="insp-meal-row">
                            <img [src]="meal.image" [alt]="meal.name" class="insp-meal-thumb" />
                            <div class="insp-meal-info">
                              <span class="insp-meal-name">{{ meal.name }}</span>
                              <span class="insp-meal-sub">{{ meal.timestamp }}</span>
                            </div>
                            <div class="insp-meal-macros num">
                              <span class="kcal-pill">{{ meal.kcal }} kcal</span>
                              <span class="p-pill">P: {{ meal.protein }}g</span>
                            </div>
                          </div>
                        }
                      </div>
                    } @else {
                      <div class="empty-day-state-compact">
                        <span>No meals logged for this date.</span>
                        <a routerLink="/nutrition/scan" class="btn btn-secondary btn-sm">+ Scan Meal</a>
                      </div>
                    }
                  </div>
                }

                <!-- 3. WATER & HYDRATION SECTION -->
                @if (inspectorTab() === 'all' || inspectorTab() === 'water') {
                  <div class="insp-section-block animated-fade-in">
                    <div class="section-sub-header">
                      <span class="section-icon">💧</span>
                      <h4>Hydration Status</h4>
                      <span class="badge badge-cyan">{{ selectedDayWater() }} of 8 Glasses ({{ selectedDayWater() * 250 }} ml)</span>
                    </div>

                    <div class="inspector-water-card">
                      <div class="water-glasses-deck">
                        @for (i of [1,2,3,4,5,6,7,8]; track i) {
                          <div class="insp-glass-box" [class.filled]="i <= selectedDayWater()">
                            <app-icon name="water" [size]="20" />
                            <span class="glass-num">{{ i }}</span>
                          </div>
                        }
                      </div>
                      <div class="water-adjust-row">
                        <span class="hydration-note">
                          {{ selectedDayWater() >= 8 ? '🎉 Daily hydration goal achieved!' : (8 - selectedDayWater()) + ' glasses left to target' }}
                        </span>
                        <div class="water-ctrl-btns">
                          <button class="btn btn-secondary btn-sm" (click)="adjustSelectedDayWater(-1)" [disabled]="selectedDayWater() <= 0">- Glass</button>
                          <button class="btn btn-primary btn-sm" (click)="adjustSelectedDayWater(1)">+ Glass</button>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Timeline Performance & Trajectory Monitor ("Improving vs Deproving") -->
          <section class="trajectory-section card">
            <div class="trajectory-header">
              <div class="traj-title-wrap">
                <div class="traj-badge-row">
                  <span class="badge badge-primary">ANALYTICS & ADAPTATIONS</span>
                  <span class="status-pill" [class]="trajectory().statusClass">
                    {{ trajectory().status }} ({{ trajectory().pctChange }})
                  </span>
                </div>
                <h2>Performance Trajectory & Improvement Monitor</h2>
                <p class="traj-sub">
                  Empirical volume analysis tracking progressive overload, neuromuscular efficiency, and CNS deload cycles.
                </p>
              </div>

              <!-- Timeframe Selector -->
              <div class="timeframe-toggles">
                @for (tf of ['daily', 'weekly', 'monthly', 'yearly']; track tf) {
                  <button
                    class="timeframe-btn"
                    [class.active]="selectedTimeframe() === tf"
                    (click)="selectedTimeframe.set($any(tf))"
                  >
                    {{ tf | uppercase }}
                  </button>
                }
              </div>
            </div>

            <!-- KPI Cards Grid -->
            <div class="traj-kpi-grid">
              <div class="traj-kpi card">
                <span class="kpi-label">Total Volume ({{ selectedTimeframe() }})</span>
                <div class="kpi-num-row">
                  <span class="kpi-val num">{{ trajectory().totalVolume | number }}</span>
                  <span class="kpi-unit">kg</span>
                </div>
                <span class="kpi-trend" [class.improving]="trajectory().status === 'Improving'">
                  {{ trajectory().pctChange }} vs prior cycle
                </span>
              </div>

              <div class="traj-kpi card">
                <span class="kpi-label">Total Sets Completed</span>
                <div class="kpi-num-row">
                  <span class="kpi-val num">{{ trajectory().totalSets }}</span>
                  <span class="kpi-unit">sets</span>
                </div>
                <span class="kpi-sub">Across all recorded sessions</span>
              </div>

              <div class="traj-kpi card">
                <span class="kpi-label">Progressive Overload</span>
                <div class="kpi-num-row">
                  <span class="kpi-val highlight">{{ trajectory().status }}</span>
                </div>
                <span class="kpi-sub">Mechanical tension trending {{ trajectory().status === 'Improving' ? 'upward' : 'steady' }}</span>
              </div>
            </div>

            <!-- Volume History Bar Chart -->
            <div class="chart-container">
              <div class="chart-header">
                <h4>Volume Progression ({{ selectedTimeframe() | uppercase }})</h4>
                <span class="chart-legend-txt">Bar height represents total tonnage in kg</span>
              </div>

              <div class="bars-flex">
                @for (bar of volumeHistory(); track bar.label) {
                  <div class="bar-col">
                    <div class="bar-num-top">{{ (bar.volumeKg / 1000) | number:'1.1-1' }}t</div>
                    <div class="bar-track">
                      <div
                        class="bar-fill"
                        [style.height.%]="getBarHeightPct(bar.volumeKg)"
                        [class.peak-bar]="bar.isPeak"
                      ></div>
                    </div>
                    <div class="bar-label">{{ bar.label }}</div>
                  </div>
                }
              </div>
            </div>

            <!-- AI Coaching Trajectory Analysis & Chat Integration -->
            <div class="ai-trajectory-card">
              <div class="ai-traj-left">
                <div class="ai-avatar-box">
                  <app-icon name="robot" [size]="20" />
                </div>
                <div class="ai-traj-text">
                  <div class="ai-traj-title">{{ trajectory().headline }}</div>
                  <div class="ai-traj-desc">{{ trajectory().description }}</div>
                </div>
              </div>
              <div class="ai-traj-actions">
                <button class="btn btn-primary ask-coach-btn" (click)="askCoachAboutTrend()">
                  <app-icon name="robot" [size]="16" />
                  <span>Discuss Trend with AI Coach →</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      }

      <!-- TAB 2: ROUTINE & MUSCLE ANATOMY HEATMAP DESIGNER (from reference screenshots) -->
      @if (activeTab() === 'routine') {
        <div class="routine-view animated-fade-in">
          <!-- Top Routine Header with Presets & Back Button -->
          <div class="routine-top-bar card">
            <div class="routine-top-main">
              <button class="back-circle-btn" (click)="activeTab.set('calendar')" title="Back to Calendar">
                <app-icon name="chevron-left" [size]="18" />
              </button>
              <div class="routine-title-block">
                <input
                  type="text"
                  [ngModel]="routineName()"
                  (ngModelChange)="routineName.set($event)"
                  class="routine-title-input"
                  aria-label="Routine Name"
                  placeholder="Routine Name (e.g. Chest Day)"
                />
                <span class="routine-subtitle">Active routine & biomechanical loading plan</span>
              </div>
            </div>

            <!-- Routine Presets Pills -->
            <div class="routine-presets-deck">
              <span class="presets-lbl">PRESETS:</span>
              <div class="presets-scroll">
                @for (preset of routinePresets; track preset) {
                  <button
                    type="button"
                    class="preset-pill-btn"
                    [class.active]="routineName() === preset"
                    (click)="selectPresetRoutine(preset)"
                  >
                    {{ preset }}
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Progression Banner Card (from Screenshots 3 & 4) -->
          <section class="progression-banner-card card">
            <div class="progression-row">
              <div class="prog-left">
                <div class="prog-icon-badge">
                  <app-icon name="progress" [size]="18" color="#22c55e" />
                </div>
                <div class="prog-meta">
                  <span class="prog-label">Progression</span>
                  <div class="prog-selector-wrap">
                    <select
                      [ngModel]="routineProgression()"
                      (ngModelChange)="routineProgression.set($event)"
                      class="prog-select"
                    >
                      <option value="Linear progression">Linear progression</option>
                      <option value="Double progression">Double progression</option>
                      <option value="RPE Autoregulation">RPE Autoregulation</option>
                      <option value="Wave Periodization">Wave Periodization</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="prog-chevron">
                <app-icon name="chevron-right" [size]="16" color="var(--text-muted)" />
              </div>
            </div>

            <div class="prog-toggle-row">
              <div class="prog-toggle-left">
                <div class="prog-pause-badge">⏸</div>
                <div class="prog-toggle-text">
                  <span class="prog-toggle-title">Exclude from automatic progression</span>
                  <span class="prog-toggle-sub">Use for planned deloads. Workouts stay in history and statistics.</span>
                </div>
              </div>
              <label class="apex-switch">
                <input
                  type="checkbox"
                  [checked]="excludeFromProgression()"
                  (change)="excludeFromProgression.set(!excludeFromProgression())"
                />
                <span class="switch-slider"></span>
              </label>
            </div>
            <div class="prog-footer-note">
              The next regular target continues from the last included workout.
            </div>
          </section>

          <!-- Exercises Deck with Reordering & Superset Linking (from Screenshots 3 & 4) -->
          <section class="routine-exercises-section">
            <div class="routine-sec-header">
              <h3>Exercises ({{ routineExercises().length }})</h3>
              <span class="sec-hint">Tap chain link icon to pair back-to-back supersets</span>
            </div>

            <div class="routine-exercises-list">
              @for (ex of routineExercises(); track ex.id; let idx = $index) {
                <!-- Superset Connector Line -->
                @if (ex.isSuperset) {
                  <div class="superset-connector-badge">
                    <span class="conn-icon">🔗</span>
                    <span class="conn-text">SUPERSET PAIR — PERFORM BACK-TO-BACK WITH ABOVE</span>
                  </div>
                }

                <div class="routine-ex-card card" [class.is-superset-child]="ex.isSuperset">
                  <!-- Left Thumbnail / Media -->
                  <div class="ex-thumb-box">
                    @if (ex.image) {
                      <img [src]="ex.image" [alt]="ex.name" class="ex-card-thumb" />
                    } @else {
                      <div class="ex-thumb-placeholder">
                        <app-icon name="barbell" [size]="20" color="#22c55e" />
                      </div>
                    }
                  </div>

                  <!-- Center Content -->
                  <div class="ex-info-col">
                    <div class="ex-name-row">
                      <h4 class="routine-ex-name">{{ ex.name }}</h4>
                      <span class="ex-target-muscle">{{ ex.muscle }}</span>
                    </div>
                    <div class="ex-reps-target-row">
                      <span class="target-reps-pill">{{ ex.targetSets }} × {{ ex.targetReps }}</span>
                      @if (ex.targetWeightKg && ex.targetWeightKg > 0) {
                        <span class="target-weight-pill">&#64; {{ ex.targetWeightKg }} kg</span>
                      }
                      @if (ex.isBodyweight) {
                        <span class="bw-pill">Bodyweight</span>
                      }
                      @if (ex.intensifier && ex.intensifier !== 'None') {
                        <span class="intensifier-pill">{{ ex.intensifier }}</span>
                      }
                    </div>
                  </div>

                  <!-- Right Actions: Superset link, reorder, config, delete -->
                  <div class="ex-actions-col">
                    <!-- Superset Toggle Link (only for index > 0) -->
                    @if (idx > 0) {
                      <button
                        type="button"
                        class="ex-action-btn link-btn"
                        [class.active]="ex.isSuperset"
                        (click)="toggleRoutineSuperset(idx)"
                        [title]="ex.isSuperset ? 'Unlink Superset' : 'Link as Superset with previous exercise'"
                      >
                        <app-icon name="link" [size]="16" />
                      </button>
                    }

                    <!-- Reorder Up/Down -->
                    <div class="reorder-col">
                      <button
                        type="button"
                        class="reorder-btn"
                        [disabled]="idx === 0"
                        (click)="moveRoutineExerciseUp(idx)"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        class="reorder-btn"
                        [disabled]="idx === routineExercises().length - 1"
                        (click)="moveRoutineExerciseDown(idx)"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>

                    <!-- Config / Settings Drawer Button -->
                    <button
                      type="button"
                      class="ex-action-btn config-btn"
                      (click)="openExerciseCustomizer(idx)"
                      title="Configure Exercise Settings"
                    >
                      <app-icon name="sliders" [size]="16" />
                    </button>

                    <!-- Remove -->
                    <button
                      type="button"
                      class="ex-action-btn delete-btn"
                      (click)="removeRoutineExercise(idx)"
                      title="Remove from Routine"
                    >
                      <app-icon name="trash" [size]="15" />
                    </button>
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- "What this session hits" - Muscle Heatmap Anatomy (from Screenshots 2, 4, 5) -->
          <section class="what-session-hits-card card">
            <div class="hits-title-block">
              <h3>What this session hits</h3>
              <p>Dynamic muscular biomechanics calculated from your active exercise roster.</p>
            </div>

            <!-- The Anatomical Human Heatmap Component -->
            <app-muscle-anatomy [muscles]="routineActiveMuscles()" />

            <!-- Superset instruction tip from screenshot 2 -->
            <div class="superset-hint-box">
              <span class="hint-chain">🔗</span>
              <span>Tap the link button on an exercise to superset it with the one above — you'll do them back-to-back.</span>
            </div>

            <!-- Bottom Routine Actions (Screenshot 2 & 5) -->
            <div class="routine-cta-buttons">
              <button type="button" class="btn btn-add-exercise" (click)="openAddExerciseToRoutineModal()">
                <app-icon name="plus" [size]="18" />
                <span>+ Add exercise</span>
              </button>

              <button type="button" class="btn btn-outline copy-routine-btn" (click)="copyCurrentRoutine()">
                <span>Copy routine</span>
              </button>

              <button type="button" class="btn btn-primary start-routine-btn" (click)="startLiveWorkoutFromRoutine()">
                <app-icon name="play" [size]="18" />
                <span>Start Live Session Now →</span>
              </button>
            </div>
          </section>
        </div>
      }

      <!-- TAB 3: EXERCISE LIBRARY -->
      @if (activeTab() === 'library') {
        <section class="library-section">
          <div class="library-header">
            <div class="title-row">
              <div>
                <h2>Workout & Mobility Library</h2>
                <p class="library-sub">
                  Explore biomechanical form cues, muscle engagement, and 3D animated movement demonstrations.
                </p>
              </div>
              <span class="counter">{{ filteredExercises().length }} of {{ workout.exerciseLibrary().length }} exercises</span>
            </div>

            <!-- Search & Filter Controls -->
            <div class="controls-row">
              <div class="search-field">
                <app-icon name="search" [size]="16" color="var(--text-muted)" />
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  placeholder="Search by exercise name, muscle (e.g. Quads, Hips), or equipment..."
                  aria-label="Search exercise library"
                />
                @if (searchQuery) {
                  <button class="clear-btn" (click)="searchQuery = ''" title="Clear search">
                    <app-icon name="close" [size]="14" />
                  </button>
                }
              </div>

              <!-- Category Filter Pills -->
              <div class="category-pills">
                @for (cat of categories; track cat) {
                  <button
                    class="pill-btn"
                    [class.active]="selectedCategory() === cat"
                    (click)="selectedCategory.set(cat)"
                  >
                    {{ cat }}
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Exercise Card Grid -->
          <div class="exercise-grid">
            @for (ex of filteredExercises(); track ex.id) {
              <div class="exercise-card card card-hover" (click)="openExercise(ex)">
                <div class="card-media">
                  @if (ex.image) {
                    <img [src]="ex.image" [alt]="ex.name" class="ex-img" />
                  } @else {
                    <div class="ex-schematic-card">
                      <div class="schematic-bg"></div>
                      <div class="schematic-content">
                        <span class="schematic-muscle">{{ ex.muscle }}</span>
                        <span class="schematic-title">{{ ex.name }}</span>
                        <div class="schematic-tags">
                          <span class="schematic-tag">{{ ex.equipment }}</span>
                          <span class="schematic-tag">{{ ex.category }}</span>
                        </div>
                      </div>
                    </div>
                  }
                  
                  @if (ex.videoUrl) {
                    <span class="motion-badge" title="3D Motion Guide Available">
                      <span class="motion-dot"></span>
                      <span>3D FORM</span>
                    </span>
                    <button class="play-overlay-btn" title="View video demonstration">
                      <app-icon name="play" [size]="14" />
                    </button>
                  } @else {
                    <span class="kinetics-badge" title="3D Biomechanical Skeletal Tracking">
                      <app-icon name="zap" [size]="10" />
                      <span>3D KINETICS</span>
                    </span>
                  }
                </div>
                <div class="card-content">
                  <div class="card-title-row">
                    <h4 class="ex-name">{{ ex.name }}</h4>
                    <span class="ex-tag">{{ ex.muscle }}</span>
                  </div>
                  <div class="ex-meta">
                    <span class="equip-badge">{{ ex.equipment }}</span>
                    <span class="meta-dot">·</span>
                    <span>Target: {{ ex.targetSetsReps }}</span>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <p>No exercises match your search "{{ searchQuery }}" in {{ selectedCategory() }}.</p>
                <button class="btn btn-secondary" (click)="clearFilters()">Reset Filters</button>
              </div>
            }
          </div>
        </section>
      }

      <!-- Add Workout Session Modal -->
      @if (showAddModal()) {
        <div class="modal-backdrop" (click)="showAddModal.set(false)">
          <div class="modal-card card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <span class="badge" [class.badge-primary]="newSessionMode === 'planned'" [class.badge-accent]="newSessionMode === 'completed'">
                  {{ newSessionMode === 'planned' ? '⚡ PLAN WORKOUT' : '✓ RECORD PAST WORKOUT' }}
                </span>
                <h3>{{ newSessionMode === 'planned' ? 'Schedule Workout Session' : 'Log Completed Workout' }}</h3>
              </div>
              <button class="close-modal-btn" (click)="showAddModal.set(false)">
                <app-icon name="close" [size]="18" />
              </button>
            </div>

            <!-- Mode Selector: Plan vs Past Log -->
            <div class="session-mode-switch">
              <button
                type="button"
                class="mode-pill"
                [class.active]="newSessionMode === 'planned'"
                (click)="newSessionMode = 'planned'"
              >
                <span class="mode-icon">⚡</span>
                <div class="mode-info">
                  <span class="mode-title">Plan / Ready to Start</span>
                  <span class="mode-sub">Add to schedule to train live · Stays uncompleted</span>
                </div>
              </button>
              <button
                type="button"
                class="mode-pill"
                [class.active]="newSessionMode === 'completed'"
                (click)="newSessionMode = 'completed'"
              >
                <span class="mode-icon">✓</span>
                <div class="mode-info">
                  <span class="mode-title">Record Past Completed</span>
                  <span class="mode-sub">Save directly to history with completed sets</span>
                </div>
              </button>
            </div>

            <div class="modal-form">
              <div class="form-group">
                <label>Workout Date</label>
                <input type="date" [(ngModel)]="newSessionDate" class="input-field" />
              </div>

              <div class="form-group">
                <label>Workout Title</label>
                <input type="text" [(ngModel)]="newSessionTitle" placeholder="e.g. Upper Body Push, Leg Day..." class="input-field" />
                <div class="quick-title-chips">
                  @for (t of ['Lower Body Strength', 'Upper Body Push', 'Back & Pull', 'Full Body Power']; track t) {
                    <button type="button" class="chip-sm" [class.chip-active]="newSessionTitle === t" (click)="selectRoutinePreset(t)">{{ t }}</button>
                  }
                </div>
              </div>

              <!-- Exercise Builder -->
              <div class="builder-section">
                <div class="builder-header">
                  <label>{{ newSessionMode === 'planned' ? 'Planned Movements' : 'Logged Movements' }} ({{ newSessionExercises.length }})</label>
                  <button class="btn btn-secondary btn-sm" (click)="addExerciseToNewSession()">+ Add Exercise</button>
                </div>

                @for (ex of newSessionExercises; track $index; let eIdx = $index) {
                  <div class="builder-ex-card">
                    <div class="b-ex-top">
                      <select [(ngModel)]="ex.exerciseId" (ngModelChange)="onExerciseSelected(eIdx, $event)" class="select-field">
                        @for (item of workout.exerciseLibrary(); track item.id) {
                          <option [value]="item.id">{{ item.name }} ({{ item.muscle }})</option>
                        }
                      </select>
                      <button class="remove-btn" (click)="removeExerciseFromNewSession(eIdx)" title="Remove exercise">✕</button>
                    </div>

                    <!-- Sets List -->
                    <div class="builder-sets-list">
                      @for (s of ex.sets; track s.setNumber; let sIdx = $index) {
                        <div class="builder-set-row">
                          <span class="s-label">Set {{ s.setNumber }}</span>
                          <div class="s-inputs">
                            <label>Weight (kg): <input type="number" [(ngModel)]="s.weightKg" class="num-input" /></label>
                            <label>Reps: <input type="number" [(ngModel)]="s.reps" class="num-input" /></label>
                          </div>
                          <button class="remove-set-btn" (click)="removeSet(eIdx, sIdx)" title="Remove set">✕</button>
                        </div>
                      }
                      <button class="add-set-link" (click)="addSetToExercise(eIdx)">+ Add Set</button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="showAddModal.set(false)">Cancel</button>
              <button class="btn btn-primary" (click)="saveNewSession()">
                {{ newSessionMode === 'planned' ? 'Schedule Session & Prepare Live ⚡' : 'Save & Log to History ✓' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Exercise Video & Form Modal -->
      @if (selectedExercise()) {
        <app-exercise-modal
          [exercise]="selectedExercise()"
          (closed)="selectedExercise.set(null)"
          (selected)="onAddExerciseToToday($event)"
        />
      }

      <!-- Exercise Customizer Drawer (Screenshot 1) -->
      @if (selectedCustomizerExercise(); as custEx) {
        <div class="customizer-overlay animated-fade-in" (click)="closeExerciseCustomizer()">
          <div class="customizer-drawer" (click)="$event.stopPropagation()">
            <div class="drawer-header">
              <div>
                <span class="drawer-sub">EXERCISE CONFIGURATION</span>
                <h3 class="drawer-title">{{ custEx.name }}</h3>
                <p class="drawer-desc">Rest after each set of this exercise. Leave at 0 to use your default rest timer.</p>
              </div>
              <button type="button" class="drawer-close-btn" (click)="closeExerciseCustomizer()">
                <app-icon name="close" [size]="18" />
              </button>
            </div>

            <div class="drawer-body">
              <!-- Bodyweight Toggle -->
              <div class="drawer-card">
                <div class="drawer-row">
                  <div class="row-left">
                    <div class="row-icon-box green">
                      <app-icon name="today" [size]="18" color="#22c55e" />
                    </div>
                    <div class="row-text">
                      <span class="row-title">Bodyweight</span>
                      <span class="row-sub">No weight to enter — just log the reps.</span>
                    </div>
                  </div>
                  <label class="apex-switch">
                    <input
                      type="checkbox"
                      [checked]="custEx.isBodyweight"
                      (change)="updateCustomizerField('isBodyweight', !custEx.isBodyweight)"
                    />
                    <span class="switch-slider"></span>
                  </label>
                </div>
              </div>

              <!-- Reps per side Toggle -->
              <div class="drawer-card">
                <div class="drawer-row">
                  <div class="row-left">
                    <div class="row-icon-box blue">
                      <app-icon name="refresh" [size]="18" color="#38bdf8" />
                    </div>
                    <div class="row-text">
                      <span class="row-title">Reps per side</span>
                      <span class="row-sub">For lunges, single-arm rows and the like.</span>
                    </div>
                  </div>
                  <label class="apex-switch">
                    <input
                      type="checkbox"
                      [checked]="custEx.repsPerSide"
                      (change)="updateCustomizerField('repsPerSide', !custEx.repsPerSide)"
                    />
                    <span class="switch-slider"></span>
                  </label>
                </div>
              </div>

              <!-- Added (kg) Stepper -->
              <div class="drawer-card">
                <div class="stepper-header">
                  <span class="stepper-title">Added (kg)</span>
                </div>
                <div class="stepper-controls">
                  <button type="button" class="stepper-btn" (click)="adjustCustomizerNumber('addedWeightKg', -2.5, 0)">−</button>
                  <span class="stepper-val">{{ custEx.addedWeightKg || 0 }}</span>
                  <button type="button" class="stepper-btn" (click)="adjustCustomizerNumber('addedWeightKg', 2.5)">+</button>
                </div>
                <div class="stepper-hint">
                  For dips or pull-ups with a belt. Progression then follows the weight.
                </div>
              </div>

              <!-- Top of the range Stepper -->
              <div class="drawer-card">
                <div class="stepper-header">
                  <span class="stepper-title">Top of the range</span>
                </div>
                <div class="stepper-controls">
                  <button type="button" class="stepper-btn" (click)="adjustCustomizerNumber('topOfRange', -1, 0)">−</button>
                  <span class="stepper-val">{{ custEx.topOfRange || 0 }}</span>
                  <button type="button" class="stepper-btn" (click)="adjustCustomizerNumber('topOfRange', 1)">+</button>
                </div>
                <div class="stepper-hint">
                  Reps climb by one whenever every set was clean. Set a ceiling to add sets instead of reps forever.
                </div>
              </div>

              <!-- Drop-set / rest-pause Intensifier Selector -->
              <div class="drawer-card">
                <div class="stepper-header">
                  <span class="stepper-sub-lbl">Drop-set / rest-pause</span>
                </div>
                <div class="selector-row">
                  <span class="selector-key">Intensifier</span>
                  <select
                    [ngModel]="custEx.intensifier || 'None'"
                    (ngModelChange)="updateCustomizerField('intensifier', $event)"
                    class="drawer-select"
                  >
                    <option value="None">None</option>
                    <option value="Drop-set">Drop-set</option>
                    <option value="Rest-pause">Rest-pause</option>
                    <option value="Myo-reps">Myo-reps</option>
                  </select>
                </div>
              </div>

              <!-- Progression Rule Selector -->
              <div class="drawer-card">
                <div class="stepper-header">
                  <span class="stepper-sub-lbl">Progression</span>
                </div>
                <div class="selector-row">
                  <span class="selector-key">Rule</span>
                  <select
                    [ngModel]="custEx.progressionRule || 'Follow the routine (Linear progression)'"
                    (ngModelChange)="updateCustomizerField('progressionRule', $event)"
                    class="drawer-select"
                  >
                    <option value="Follow the routine (Linear progression)">Follow the routine (Linear)</option>
                    <option value="Double progression">Double progression</option>
                    <option value="Wave loading">Wave loading</option>
                    <option value="Stepped Progression">Stepped Progression</option>
                  </select>
                </div>
                <div class="stepper-hint">
                  Hit every rep in every set and the weight goes up. Repeated misses trigger a deload.
                </div>
              </div>

              <!-- Step (kg) Stepper -->
              <div class="drawer-card">
                <div class="stepper-header">
                  <span class="stepper-title">Step (kg)</span>
                </div>
                <div class="stepper-controls">
                  <button type="button" class="stepper-btn" (click)="adjustCustomizerNumber('stepKg', -0.5, 0.5)">−</button>
                  <span class="stepper-val">{{ custEx.stepKg || 2.5 }}</span>
                  <button type="button" class="stepper-btn" (click)="adjustCustomizerNumber('stepKg', 0.5)">+</button>
                </div>
              </div>

              <!-- Note (optional) -->
              <div class="drawer-card">
                <div class="stepper-header">
                  <span class="stepper-sub-lbl">Note (optional) — loading cues, reminders</span>
                </div>
                <textarea
                  [ngModel]="custEx.notes"
                  (ngModelChange)="updateCustomizerField('notes', $event)"
                  placeholder="e.g. bar only then +1 plate/side each set, pause 1s at bottom..."
                  class="drawer-textarea"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="drawer-footer">
              <button type="button" class="btn btn-primary btn-block" (click)="closeExerciseCustomizer()">
                Done & Save Parameters
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Add Exercise to Routine Modal -->
      @if (showRoutineAddModal()) {
        <div class="customizer-overlay animated-fade-in" (click)="showRoutineAddModal.set(false)">
          <div class="routine-add-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h3>Add Exercise to Routine</h3>
                <p class="modal-sub">Choose from verified kinematic movements or search by muscle group</p>
              </div>
              <button type="button" class="close-modal-btn" (click)="showRoutineAddModal.set(false)">
                <app-icon name="close" [size]="18" />
              </button>
            </div>

            <!-- Search & Filter Controls -->
            <div class="modal-search-row">
              <app-icon name="search" [size]="16" color="var(--text-muted)" />
              <input
                type="text"
                [ngModel]="routineAddSearch()"
                (ngModelChange)="routineAddSearch.set($event)"
                placeholder="Search exercise by name or muscle (e.g. Bench, Squat, Delts)..."
                class="modal-search-input"
              />
            </div>

            <div class="modal-cat-pills">
              @for (cat of ['All', 'Strength', 'Hypertrophy', 'Mobility', 'Core']; track cat) {
                <button
                  type="button"
                  class="cat-chip"
                  [class.active]="routineAddCategory() === cat"
                  (click)="routineAddCategory.set(cat)"
                >
                  {{ cat }}
                </button>
              }
            </div>

            <!-- Exercises List -->
            <div class="modal-exercises-list">
              @for (ex of filteredRoutineAddExercises(); track ex.id) {
                <div class="modal-ex-item" (click)="addLibraryExerciseToRoutine(ex)">
                  <div class="item-left">
                    <span class="item-name">{{ ex.name }}</span>
                    <div class="item-meta">
                      <span class="item-muscle">{{ ex.muscle }}</span>
                      <span class="item-equip">{{ ex.equipment }}</span>
                    </div>
                  </div>
                  <button type="button" class="btn btn-secondary btn-sm">
                    + Add
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .training-hub {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }

    /* Athlete Level & Achievements Ribbon */
    .athlete-level-ribbon {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(11, 16, 21, 0.95) 50%, rgba(34, 197, 94, 0.08) 100%);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: var(--r-card);
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
    }
    .ribbon-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
    }
    .athlete-rank-col {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 280px;
      flex: 1;
    }
    .rank-shield {
      width: 58px;
      height: 64px;
      background: linear-gradient(180deg, #f59e0b 0%, #b45309 100%);
      border-radius: 8px 8px 24px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #0b1015;
      font-weight: 900;
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
      border: 2px solid #fef3c7;
      flex-shrink: 0;
    }
    .shield-lvl {
      font-size: 0.62rem;
      letter-spacing: 0.08em;
      line-height: 1;
    }
    .shield-num {
      font-size: 1.55rem;
      line-height: 1;
      font-family: var(--font-display);
    }
    .rank-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }
    .rank-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .rank-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: 0.04em;
      margin: 0;
    }
    .streak-badge {
      font-size: 0.68rem;
      font-weight: 800;
      background: rgba(239, 68, 68, 0.18);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.35);
      padding: 2px 8px;
      border-radius: var(--r-pill);
    }
    .xp-bar-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .xp-bar-track {
      width: 100%;
      height: 7px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--r-pill);
      overflow: hidden;
    }
    .xp-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #f59e0b 0%, #22c55e 100%);
      border-radius: var(--r-pill);
      transition: width 0.4s ease;
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
    }
    .xp-text-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 0.68rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .xp-left {
      color: var(--primary);
    }

    /* Achievements Badges */
    .achievements-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1.5;
    }
    .achieve-col-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .achieve-lbl {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.06em;
    }
    .achieve-hint {
      font-size: 0.62rem;
      color: var(--text-faint);
    }
    .badges-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .medal-badge-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(11, 16, 21, 0.7);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 6px 10px;
      color: var(--text);
      cursor: pointer;
      transition: all var(--t-fast);
      text-align: left;
    }
    .medal-badge-btn:hover {
      border-color: rgba(245, 158, 11, 0.5);
      background: rgba(245, 158, 11, 0.1);
      transform: translateY(-2px);
    }
    .medal-badge-btn.unlocked {
      border-color: rgba(245, 158, 11, 0.35);
    }
    .medal-badge-btn.locked {
      opacity: 0.55;
      filter: grayscale(0.5);
    }
    .medal-badge-btn.is-active {
      border-color: var(--primary);
      background: rgba(34, 197, 94, 0.15);
      box-shadow: 0 0 12px rgba(34, 197, 94, 0.3);
    }
    .badge-icon {
      font-size: 1.15rem;
    }
    .badge-info {
      display: flex;
      flex-direction: column;
    }
    .badge-name {
      font-size: 0.72rem;
      font-weight: 800;
      color: #fff;
    }
    .badge-stat {
      font-size: 0.62rem;
      color: var(--text-muted);
    }
    .badge-xp-tag {
      font-size: 0.58rem;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: var(--r-pill);
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.4);
    }

    /* Achievement Drawer */
    .achievement-inspect-drawer {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(245, 158, 11, 0.4);
      border-radius: var(--r-md);
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .aid-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .aid-icon {
      font-size: 1.8rem;
    }
    .aid-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .aid-title-row h4 {
      font-size: 0.92rem;
      font-weight: 800;
      color: #fff;
      margin: 0;
    }
    .aid-status {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: var(--r-pill);
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-muted);
    }
    .aid-status.unlocked {
      background: rgba(34, 197, 94, 0.2);
      color: var(--primary);
    }
    .aid-desc {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 2px 0;
    }
    .aid-date {
      font-size: 0.65rem;
      color: var(--text-faint);
    }
    .close-drawer-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1rem;
      padding: 4px;
    }

    /* Program Switcher Strip */
    .program-switcher-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      flex-wrap: wrap;
    }
    .prog-label-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .prog-tag {
      font-size: 0.62rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.06em;
    }
    .prog-active-name {
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--primary);
    }
    .prog-pills-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .prog-pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: var(--r-pill);
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--t-fast);
    }
    .prog-pill-btn:hover {
      border-color: rgba(34, 197, 94, 0.4);
      color: #fff;
    }
    .prog-pill-btn.active {
      background: rgba(34, 197, 94, 0.18);
      border-color: var(--primary);
      color: var(--primary);
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.25);
    }
    .p-days {
      font-size: 0.6rem;
      padding: 1px 4px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    /* Quick Guide Strip (User Friendly Onboarding) */
    .quick-guide-strip {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(11, 16, 21, 0.95) 100%);
      border: 1px solid rgba(34, 197, 94, 0.25);
      border-radius: var(--r-card);
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    .qg-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .qg-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .qg-badge {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .qg-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .qg-toggle-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: var(--r-pill);
      cursor: pointer;
      transition: all var(--t-fast);
    }
    .qg-toggle-btn:hover {
      color: var(--text);
      border-color: rgba(255, 255, 255, 0.3);
    }
    .qg-steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .qg-step-card {
      background: rgba(11, 16, 21, 0.75);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 12px 14px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      transition: all var(--t-fast) var(--ease);
    }
    .qg-step-card:hover {
      border-color: rgba(34, 197, 94, 0.4);
      background: rgba(11, 16, 21, 0.95);
      transform: translateY(-2px);
    }
    .qg-step-card.highlight {
      border-color: rgba(34, 197, 94, 0.35);
      background: rgba(34, 197, 94, 0.05);
    }
    .qg-step-num {
      font-family: var(--font-display);
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--primary);
      line-height: 1;
    }
    .qg-step-content h5 {
      font-size: 0.88rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 3px;
    }
    .qg-step-content p {
      font-size: 0.76rem;
      color: var(--text-muted);
      line-height: 1.35;
    }

    /* Added Toast Banner */
    .added-toast-banner {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(11, 16, 21, 0.95) 100%);
      border: 1px solid var(--primary);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 18px;
      animation: slideInDown 0.25s ease;
      flex-wrap: wrap;
    }
    .toast-left {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      color: #fff;
      font-size: 0.9rem;
    }

    /* Just Finished Alert */
    .just-finished-alert {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(11, 16, 21, 0.95) 100%);
      border: 1px solid var(--primary);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 20px;
      animation: slideInDown 0.3s ease;
    }
    .alert-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .alert-icon {
      font-size: 1.8rem;
    }
    .alert-title {
      font-size: 1.05rem;
      color: #fff;
    }
    .alert-sub {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .close-alert-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
    }

    /* Primary Tab Switcher */
    .hub-tabs-nav {
      display: flex;
      gap: 10px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
    }
    .hub-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: var(--r-md);
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-muted);
      font-weight: 700;
      font-size: var(--fs-sm);
      cursor: pointer;
      transition: all var(--t-fast) var(--ease);
    }
    .hub-tab-btn:hover {
      color: var(--text);
      background: var(--surface-2);
    }
    .hub-tab-btn.active {
      background: var(--primary);
      color: var(--on-primary);
      border-color: var(--primary);
      box-shadow: 0 0 12px var(--primary-soft);
    }
    .lib-count-badge {
      background: rgba(0, 0, 0, 0.25);
      padding: 2px 8px;
      border-radius: var(--r-pill);
      font-size: 0.7rem;
    }

    /* Session Banner */
    .session-banner {
      background: linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%);
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      padding: var(--s-4);
    }
    .banner-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-4);
      flex-wrap: wrap;
      width: 100%;
    }
    .banner-left {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .banner-left h2 {
      font-size: clamp(1.4rem, 2.5vw, 1.8rem);
    }
    .banner-left p {
      font-size: var(--fs-sm);
      color: var(--text-muted);
    }
    .banner-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .start-btn {
      padding: 12px 28px;
      font-size: var(--fs-md);
    }
    .ghost-restart-link {
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: var(--r-pill);
      border: 1px solid var(--border);
      transition: all var(--t-fast) var(--ease);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .ghost-restart-link:hover {
      color: var(--text);
      border-color: rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.04);
    }
    .btn-reopen {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.4);
      font-size: var(--fs-sm);
      font-weight: 700;
      padding: 10px 18px;
      border-radius: var(--r-pill);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all var(--t-fast) var(--ease);
    }
    .btn-reopen:hover {
      background: rgba(245, 158, 11, 0.22);
      border-color: #f59e0b;
      transform: translateY(-1px);
      box-shadow: 0 2px 10px rgba(245, 158, 11, 0.2);
    }
    .btn-reopen-sm {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.35);
      font-size: 0.72rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--r-pill);
      cursor: pointer;
      transition: all var(--t-fast) var(--ease);
    }
    .btn-reopen-sm:hover {
      background: rgba(245, 158, 11, 0.25);
      border-color: #f59e0b;
    }
    .btn-delete-ghost {
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: rgba(239, 68, 68, 0.85);
      font-size: var(--fs-xs);
      font-weight: 700;
      padding: 8px 14px;
      border-radius: var(--r-pill);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all var(--t-fast) var(--ease);
    }
    .btn-delete-ghost:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: #ef4444;
      color: #ef4444;
    }
    .sess-card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .day-planned-pill {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: var(--r-pill);
      padding: 1px 6px;
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--accent-1);
    }
    .session-mode-switch {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: var(--s-1);
    }
    .mode-pill {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 10px 12px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      cursor: pointer;
      text-align: left;
      transition: all var(--t-fast) var(--ease);
    }
    .mode-pill:hover {
      background: var(--surface-3);
      border-color: var(--border-strong);
    }
    .mode-pill.active {
      background: rgba(34, 197, 94, 0.08);
      border-color: var(--primary);
      box-shadow: 0 0 12px rgba(34, 197, 94, 0.15);
    }
    .mode-icon {
      font-size: 1.15rem;
      line-height: 1;
      padding-top: 2px;
    }
    .mode-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .mode-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text);
    }
    .mode-sub {
      font-size: 0.7rem;
      color: var(--text-muted);
      line-height: 1.25;
    }
    .banner-exercises-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      width: 100%;
      border-top: 1px solid var(--border);
      padding-top: var(--s-3);
    }
    .banner-ex-item {
      background: rgba(11, 16, 21, 0.65);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all var(--t-fast) var(--ease);
    }
    .banner-ex-item.is-completed {
      border-color: rgba(34, 197, 94, 0.4);
      background: rgba(34, 197, 94, 0.06);
    }
    .b-ex-top-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .b-ex-num {
      font-size: 0.68rem;
      font-weight: 800;
      color: var(--text-faint);
      letter-spacing: 0.05em;
    }
    .b-ex-muscle {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--accent-1);
    }
    .b-ex-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text);
      line-height: 1.25;
    }
    .b-ex-meta {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .b-ex-status {
      margin-top: auto;
      padding-top: 4px;
    }
    .status-pill {
      display: inline-block;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: var(--r-pill);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .status-ready {
      background: rgba(56, 189, 248, 0.12);
      color: var(--accent-1);
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .status-done {
      background: rgba(34, 197, 94, 0.15);
      color: var(--primary);
      border: 1px solid rgba(34, 197, 94, 0.4);
    }
    .status-scheduled {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.35);
    }
    .status-rest {
      background: rgba(148, 163, 184, 0.15);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.25);
    }
    .banner-badge-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 6px;
    }
    .badge-scheduled {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.35);
    }
    .badge-muted {
      background: var(--surface-3);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }
    .jump-today-btn {
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.35);
      color: var(--primary);
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: var(--r-pill);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all var(--t-fast);
    }
    .jump-today-btn:hover {
      background: var(--primary);
      color: var(--on-primary, #000);
      transform: translateY(-1px);
    }
    .chip-sm.chip-active {
      background: var(--primary);
      color: var(--on-primary);
      border-color: var(--primary);
    }

    /* Calendar & Inspector Split */
    .calendar-inspector-split {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: var(--s-4);
    }

    /* Calendar Card */
    .calendar-card {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .cal-month-title {
      font-size: 1.25rem;
      font-weight: 800;
    }
    .cal-subtitle {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .cal-nav-buttons {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cal-btn {
      padding: 6px 12px;
      border-radius: var(--r-md);
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text);
      font-weight: 700;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all var(--t-fast) var(--ease);
    }
    .cal-btn:hover {
      background: var(--surface-3);
    }
    .today-jump-btn {
      color: var(--primary);
    }

    .weekdays-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--text-muted);
      padding: 6px 0;
      border-bottom: 1px solid var(--border);
    }
    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
    }
    .day-cell {
      aspect-ratio: 1;
      min-height: 52px;
      border-radius: var(--r-md);
      background: var(--surface-2);
      border: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 6px 4px;
      cursor: pointer;
      transition: all var(--t-fast) var(--ease);
      position: relative;
    }
    .day-cell:hover {
      background: var(--surface-3);
      border-color: rgba(255, 255, 255, 0.2);
    }
    .day-cell.other-month {
      opacity: 0.35;
    }
    .day-cell.is-today {
      border-color: rgba(34, 197, 94, 0.5);
    }
    .day-cell.is-selected {
      background: rgba(34, 197, 94, 0.12);
      border-color: var(--primary);
      box-shadow: 0 0 10px var(--primary-soft);
    }
    .day-num {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text);
    }
    .day-cell.is-today .day-num {
      color: var(--primary);
    }
    .day-micro-pills {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .day-dots-group {
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .day-meal-micro-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--macro-protein, #f59e0b);
      box-shadow: 0 0 4px rgba(245, 158, 11, 0.6);
    }
    .day-water-micro-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--accent-1, #00d4ff);
      box-shadow: 0 0 4px rgba(0, 212, 255, 0.6);
    }
    .meal-dot-sample {
      background: #f59e0b;
    }
    .water-dot-sample {
      background: #00d4ff;
    }
    .day-workout-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid var(--primary);
      padding: 1px 4px;
      border-radius: var(--r-pill);
      font-size: 0.65rem;
      color: var(--primary);
      font-weight: 800;
    }
    .workout-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--primary);
    }

    .cal-legend {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-top: 8px;
      border-top: 1px solid var(--border);
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .today-dot {
      border: 1px solid var(--primary);
    }
    .workout-dot-sample {
      background: var(--primary);
    }
    .selected-dot-sample {
      background: rgba(34, 197, 94, 0.25);
      border: 1px solid var(--primary);
    }

    /* Inspector Card */
    .inspector-card {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .inspector-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }
    .inspector-tags-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-day-pill {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: var(--r-pill);
      background: var(--surface-3);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }
    .status-day-pill.live-pill {
      background: rgba(34, 197, 94, 0.15);
      color: var(--primary);
      border-color: rgba(34, 197, 94, 0.4);
    }
    .status-day-pill.future-pill {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border-color: rgba(168, 85, 247, 0.4);
    }
    .inspector-badge {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .inspector-date-title {
      font-size: 1.15rem;
      color: var(--text);
      margin-top: 2px;
    }
    .inspector-hint {
      font-size: 0.72rem;
      color: var(--text-faint);
    }
    .add-day-btn {
      padding: 6px 14px;
      font-size: 0.78rem;
    }

    /* Inspector Filter Nav */
    .inspector-filter-nav {
      display: flex;
      gap: 6px;
      padding: 4px;
      background: var(--surface-2);
      border-radius: var(--r-md);
      overflow-x: auto;
    }
    .insp-tab-btn {
      padding: 6px 12px;
      font-size: 0.76rem;
      font-weight: 700;
      border-radius: var(--r-sm);
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--t-fast);
    }
    .insp-tab-btn:hover {
      color: var(--text);
    }
    .insp-tab-btn.active {
      background: var(--surface);
      color: var(--primary);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }

    /* Inspector 3-KPI Deck */
    .inspector-kpi-deck {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .insp-kpi-card {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: all var(--t-fast) var(--ease);
      position: relative;
    }
    .insp-kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }
    .insp-kpi-card.workout-kpi.has-data {
      border-color: rgba(34, 197, 94, 0.4);
      background: linear-gradient(135deg, var(--surface-2) 0%, rgba(34, 197, 94, 0.08) 100%);
    }
    .insp-kpi-card.meals-kpi.has-data {
      border-color: rgba(245, 158, 11, 0.4);
      background: linear-gradient(135deg, var(--surface-2) 0%, rgba(245, 158, 11, 0.08) 100%);
    }
    .insp-kpi-card.water-kpi.has-data {
      border-color: rgba(0, 212, 255, 0.4);
      background: linear-gradient(135deg, var(--surface-2) 0%, rgba(0, 212, 255, 0.08) 100%);
    }
    .kpi-val-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .kpi-water-micro-btns {
      display: flex;
      gap: 4px;
    }
    .micro-btn {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid var(--border);
      background: var(--surface-3);
      color: var(--text);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--t-fast);
    }
    .micro-btn:hover:not(:disabled) {
      background: var(--accent-1);
      color: #000;
    }
    .micro-btn.plus:hover {
      background: var(--primary);
      color: #000;
    }
    .micro-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .kpi-action-link {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--macro-protein, #f59e0b);
      text-decoration: none;
    }
    .kpi-action-link:hover {
      text-decoration: underline;
    }
    .kpi-top-lbl {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .kpi-val {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--text);
    }
    .kpi-sub {
      font-size: 0.68rem;
      color: var(--text-muted);
    }

    /* Section Subheaders */
    .insp-section-block {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--border);
    }
    .section-sub-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-sub-header h4 {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text);
      margin: 0;
    }
    .section-count {
      font-size: 0.7rem;
      font-weight: 700;
      background: var(--surface-3);
      padding: 1px 6px;
      border-radius: var(--r-pill);
      color: var(--text-muted);
    }

    /* Macro Breakdown Card */
    .macro-breakdown-card {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 8px 12px;
    }
    .macro-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }
    .macro-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
    }
    .macro-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .macro-name {
      color: var(--text-muted);
    }
    .macro-val {
      font-weight: 700;
      color: var(--text);
    }

    /* Inspector Meals List */
    .inspector-meals-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .insp-meal-row {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 6px 10px;
      transition: all var(--t-fast);
    }
    .insp-meal-row:hover {
      background: var(--surface-3);
    }
    .insp-meal-thumb {
      width: 40px;
      height: 40px;
      border-radius: var(--r-sm);
      object-fit: cover;
      flex-shrink: 0;
    }
    .insp-meal-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .insp-meal-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .insp-meal-sub {
      font-size: 0.68rem;
      color: var(--text-muted);
    }
    .insp-meal-macros {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
    }
    .kcal-pill {
      font-weight: 800;
      color: var(--primary);
    }
    .p-pill {
      color: var(--text-muted);
    }

    /* Water Section */
    .inspector-water-card {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .water-glasses-deck {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 6px;
    }
    .insp-glass-box {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-sm);
      padding: 8px 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--text-faint);
      transition: all var(--t-fast);
    }
    .insp-glass-box.filled {
      color: var(--accent-1, #00d4ff);
      border-color: rgba(0, 212, 255, 0.4);
      background: rgba(0, 212, 255, 0.08);
      filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.3));
    }
    .glass-num {
      font-size: 0.6rem;
      font-weight: 700;
    }
    .water-adjust-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }
    .hydration-note {
      font-size: 0.74rem;
      color: var(--text-muted);
    }
    .water-ctrl-btns {
      display: flex;
      gap: 6px;
    }

    .empty-day-state-compact {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--surface-2);
      border: 1px dashed var(--border);
      border-radius: var(--r-md);
      padding: 10px 14px;
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .animated-fade-in {
      animation: fadeInSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeInSlideUp {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .sessions-stack {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      max-height: 480px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .logged-session-card {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .sess-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .sess-title {
      font-size: 1rem;
      color: var(--text);
      font-weight: 700;
    }
    .sess-time {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .delete-sess-btn {
      background: transparent;
      border: none;
      color: var(--text-faint);
      cursor: pointer;
      padding: 4px;
    }
    .delete-sess-btn:hover {
      color: var(--danger);
    }

    .sess-metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .metric-pill {
      background: rgba(11, 16, 21, 0.7);
      border: 1px solid var(--border);
      padding: 8px 12px;
      border-radius: var(--r-md);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .metric-pill .m-lbl {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }
    .metric-pill .m-val {
      font-size: 1.1rem;
      font-weight: 800;
      color: #fff;
    }

    .sess-exercises-detail {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--border);
    }
    .detail-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .detail-label {
      font-size: 0.7rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .ex-detail-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: rgba(11, 16, 21, 0.6);
      border: 1px solid var(--border);
      padding: 10px 14px;
      border-radius: var(--r-md);
      transition: all var(--t-fast) var(--ease);
    }
    .ex-detail-item:hover {
      border-color: rgba(255, 255, 255, 0.18);
      background: rgba(11, 16, 21, 0.85);
    }
    .ex-detail-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }
    .ex-left-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      min-width: 0;
    }
    .ex-bullet {
      color: var(--primary);
      font-size: 0.75rem;
    }
    .ex-title-txt {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text);
      overflow-wrap: break-word;
      word-break: normal;
    }
    .ex-muscle-tag {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--accent-1);
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.25);
      padding: 2px 7px;
      border-radius: var(--r-pill);
    }
    .form-preview-btn {
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: var(--accent-1);
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: var(--r-pill);
      cursor: pointer;
      transition: all var(--t-fast);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .form-preview-btn:hover {
      background: var(--accent-1);
      color: #000;
    }
    .sets-chips-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .set-chip {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 4px 10px;
      border-radius: var(--r-pill);
      font-size: 0.76rem;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
    }
    .chip-type-tag {
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-faint);
    }
    .chip-type-tag.warm {
      color: #f59e0b;
    }
    .chip-type-tag.pr {
      color: var(--primary);
    }
    .set-chip.pr-chip {
      border-color: rgba(34, 197, 94, 0.5);
      background: rgba(34, 197, 94, 0.12);
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
    }
    .set-chip.warm-chip {
      border-color: rgba(245, 158, 11, 0.4);
      background: rgba(245, 158, 11, 0.08);
    }
    .set-chip strong {
      color: var(--text);
    }

    .empty-day-state {
      text-align: center;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .empty-icon {
      font-size: 2.2rem;
    }
    .empty-day-state h4 {
      font-size: 1.05rem;
    }
    .empty-day-state p {
      font-size: 0.8rem;
      color: var(--text-muted);
      max-width: 300px;
    }

    /* Trajectory & Improvement Monitor Section */
    .trajectory-section {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .trajectory-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .traj-badge-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }
    .status-pill {
      font-size: 0.75rem;
      font-weight: 800;
      padding: 2px 10px;
      border-radius: var(--r-pill);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stat-improving {
      background: rgba(34, 197, 94, 0.15);
      color: var(--primary);
      border: 1px solid var(--primary);
    }
    .stat-maintaining {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid #38bdf8;
    }
    .stat-deproving {
      background: rgba(249, 115, 22, 0.15);
      color: #f97316;
      border: 1px solid #f97316;
    }
    .traj-sub {
      font-size: var(--fs-sm);
      color: var(--text-muted);
    }

    .timeframe-toggles {
      display: flex;
      gap: 4px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      padding: 3px;
      border-radius: var(--r-pill);
    }
    .timeframe-btn {
      padding: 5px 14px;
      border-radius: var(--r-pill);
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--t-fast) var(--ease);
    }
    .timeframe-btn.active {
      background: var(--primary);
      color: var(--on-primary);
    }

    .traj-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--s-3);
    }
    .traj-kpi {
      padding: var(--s-3) var(--s-4);
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: var(--surface-2);
    }
    .kpi-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 700;
    }
    .kpi-num-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }
    .kpi-val {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text);
    }
    .kpi-val.highlight {
      font-size: 1.25rem;
      color: var(--primary);
    }
    .kpi-unit {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .kpi-trend {
      font-size: 0.75rem;
      color: var(--primary);
      font-weight: 700;
    }
    .kpi-sub {
      font-size: 0.72rem;
      color: var(--text-faint);
    }

    /* Bar Chart */
    .chart-container {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      padding: var(--s-4);
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .chart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .chart-legend-txt {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .bars-flex {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      height: 180px;
      padding-top: 20px;
    }
    .bar-col {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
    }
    .bar-num-top {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted);
    }
    .bar-track {
      width: 100%;
      max-width: 44px;
      height: 120px;
      background: var(--surface-3);
      border-radius: var(--r-sm) var(--r-sm) 0 0;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
    }
    .bar-fill {
      width: 100%;
      background: linear-gradient(180deg, var(--primary) 0%, rgba(34, 197, 94, 0.4) 100%);
      border-radius: var(--r-sm) var(--r-sm) 0 0;
      transition: height 0.4s var(--ease);
    }
    .bar-fill.peak-bar {
      background: linear-gradient(180deg, var(--accent-1) 0%, rgba(245, 158, 11, 0.5) 100%);
    }
    .bar-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-muted);
    }

    /* AI Trajectory Card */
    .ai-trajectory-card {
      background: rgba(34, 197, 94, 0.05);
      border: 1px solid rgba(34, 197, 94, 0.25);
      border-radius: var(--r-lg);
      padding: var(--s-3) var(--s-4);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .ai-traj-left {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      max-width: 800px;
    }
    .ai-avatar-box {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid var(--primary);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .ai-traj-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--text);
    }
    .ai-traj-desc {
      font-size: 0.82rem;
      color: var(--text-muted);
      line-height: 1.4;
      margin-top: 2px;
    }
    .ask-coach-btn {
      white-space: nowrap;
      font-size: 0.82rem;
      padding: 8px 16px;
    }

    /* Library Section Styles */
    .library-section {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .library-header {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .title-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }
    .counter {
      font-size: var(--fs-xs);
      color: var(--text-muted);
    }
    .controls-row {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .search-field {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      padding: 8px 14px;
      border-radius: var(--r-pill);
    }
    .search-field input {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text);
      font-size: var(--fs-sm);
      outline: none;
    }
    .clear-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
    }
    .category-pills {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .pill-btn {
      padding: 6px 16px;
      border-radius: var(--r-pill);
      font-size: var(--fs-xs);
      font-weight: 600;
      color: var(--text-muted);
      background: var(--surface);
      border: 1px solid var(--border);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--t-fast) var(--ease);
    }
    .pill-btn:hover {
      color: var(--text);
      background: var(--surface-2);
    }
    .pill-btn.active {
      background: var(--primary);
      color: var(--on-primary);
      border-color: var(--primary);
    }

    .exercise-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--s-4);
    }
    .exercise-card {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .card-media {
      position: relative;
      height: 160px;
      background: var(--surface-2);
    }
    .ex-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: contrast(1.05) brightness(0.9);
      transition: transform var(--t-med) var(--ease);
    }
    .exercise-card:hover .ex-img {
      transform: scale(1.03);
    }
    .ex-schematic-card {
      width: 100%;
      height: 100%;
      position: relative;
      background: radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.12) 0%, rgba(18, 26, 33, 0.95) 70%);
      border-bottom: 1px solid var(--border);
      overflow: hidden;
    }
    .schematic-content {
      position: absolute;
      inset: 0;
      padding: var(--s-3);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 4px;
    }
    .schematic-muscle {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .schematic-title {
      font-size: var(--fs-md);
      font-weight: 700;
      color: #fff;
    }
    .schematic-tags {
      display: flex;
      gap: 6px;
      margin-top: 2px;
    }
    .schematic-tag {
      font-size: 0.65rem;
      background: rgba(255, 255, 255, 0.08);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--text-muted);
    }
    .motion-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(11, 16, 21, 0.85);
      border: 1px solid var(--primary);
      padding: 3px 8px;
      border-radius: var(--r-pill);
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 5px;
      backdrop-filter: blur(4px);
    }
    .motion-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 6px var(--primary);
    }
    .kinetics-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(11, 16, 21, 0.85);
      border: 1px solid var(--border);
      padding: 3px 8px;
      border-radius: var(--r-pill);
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 5px;
      backdrop-filter: blur(4px);
    }
    .play-overlay-btn {
      position: absolute;
      right: 12px;
      bottom: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(11, 16, 21, 0.85);
      border: 1px solid var(--border);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
    }
    .card-content {
      padding: var(--s-3) var(--s-4);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .card-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ex-name {
      font-size: var(--fs-sm);
      color: var(--text);
    }
    .ex-tag {
      font-size: 0.65rem;
      color: var(--text-faint);
    }
    .ex-meta {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .meta-dot {
      color: var(--text-faint);
    }
    .equip-badge {
      font-size: 0.68rem;
      background: var(--surface-3);
      padding: 1px 6px;
      border-radius: var(--r-pill);
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--s-4);
    }
    .modal-card {
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      background: var(--surface);
      border: 1px solid var(--border);
      padding: var(--s-4);
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .close-modal-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
    }
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
    }
    .input-field, .select-field {
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 8px 12px;
      border-radius: var(--r-md);
      font-size: 0.85rem;
      outline: none;
    }
    .quick-title-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }
    .chip-sm {
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 2px 8px;
      border-radius: var(--r-pill);
      font-size: 0.7rem;
      cursor: pointer;
    }
    .builder-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      border-top: 1px solid var(--border);
      padding-top: 10px;
    }
    .builder-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .builder-ex-card {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .b-ex-top {
      display: flex;
      gap: 8px;
    }
    .b-ex-top select {
      flex: 1;
    }
    .remove-btn, .remove-set-btn {
      background: transparent;
      border: none;
      color: var(--text-faint);
      cursor: pointer;
    }
    .builder-sets-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .builder-set-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--surface);
      padding: 4px 8px;
      border-radius: var(--r-sm);
      font-size: 0.75rem;
    }
    .s-inputs {
      display: flex;
      gap: 12px;
    }
    .num-input {
      width: 55px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    .add-set-link {
      background: transparent;
      border: none;
      color: var(--primary);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      align-self: flex-start;
    }
    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding-top: var(--s-3);
      border-top: 1px solid var(--border);
    }

    @keyframes slideInDown {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (max-width: 1024px) {
      .banner-exercises-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 900px) {
      .calendar-inspector-split {
        grid-template-columns: 1fr;
      }
      .bars-flex {
        gap: 8px;
      }
    }
    @media (max-width: 768px) {
      .qg-steps-grid {
        grid-template-columns: 1fr;
      }
      .qg-top {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .qg-title-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      .qg-subtitle {
        font-size: 0.72rem;
      }
      .banner-exercises-grid {
        grid-template-columns: 1fr;
      }
      .session-banner {
        flex-direction: column;
        align-items: stretch;
      }
      .banner-right {
        width: 100%;
        flex-direction: column;
      }
      .start-btn {
        width: 100%;
        justify-content: center;
      }
      .inspector-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .inspector-actions-top {
        width: 100%;
      }
      .add-day-btn {
        width: 100%;
        justify-content: center;
      }
      .ex-detail-title-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }
      .form-preview-btn {
        width: 100%;
        justify-content: center;
      }
      .sets-chips-wrap {
        flex-wrap: wrap;
      }
      .set-chip {
        font-size: 0.72rem;
        padding: 3px 8px;
      }
      .cal-legend {
        flex-wrap: wrap;
        gap: 8px;
        font-size: 0.68rem;
      }
      .calendar-card, .inspector-card {
        padding: 12px;
      }
      .exercise-grid {
        grid-template-columns: 1fr;
      }
      .card-media {
        height: 130px;
      }
      .ai-trajectory-card {
        flex-direction: column;
        align-items: stretch;
      }
      .ask-coach-btn {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 600px) {
      .calendar-card {
        width: 100%;
        max-width: 100%;
        overflow: hidden;
      }
      .days-grid {
        gap: 2px;
      }
      .weekdays-grid {
        font-size: 0.65rem;
        padding: 4px 0;
      }
      .day-cell {
        min-height: 42px;
        padding: 3px 1px;
        aspect-ratio: auto;
      }
      .day-num {
        font-size: 0.72rem;
      }
      .day-workout-pill {
        font-size: 0.5rem;
        padding: 1px 2px;
        gap: 2px;
      }
      .workout-dot {
        width: 4px;
        height: 4px;
      }
      .sess-metrics-row {
        grid-template-columns: 1fr;
        gap: 4px;
      }
      .metric-pill {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 6px 10px;
      }
      .water-glasses-deck {
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
      }
      .inspector-kpi-deck {
        grid-template-columns: 1fr;
      }
      .timeframe-toggles {
        overflow-x: auto;
        max-width: 100%;
      }
      .timeframe-btn {
        padding: 4px 8px;
        font-size: 0.65rem;
      }
      .traj-kpi-grid {
        grid-template-columns: 1fr;
      }
      .bars-flex {
        gap: 6px;
      }
      .bar-num-top {
        font-size: 0.58rem;
      }
      .bar-label {
        font-size: 0.58rem;
      }
    }

    /* Session Anatomy Strip in Calendar View */
    .sess-anatomy-strip {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .sess-anatomy-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .sess-anatomy-tag {
      font-size: 0.65rem;
      font-weight: 800;
      color: #22c55e;
      letter-spacing: 0.08em;
    }
    .sess-anatomy-sub {
      display: block;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Routine View Styles (Matching reference screenshots) */
    .routine-tab-badge {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
      font-size: 0.58rem;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 9999px;
      letter-spacing: 0.06em;
      margin-left: 4px;
    }
    .routine-view {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
    }
    .routine-top-bar {
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: #0f141c;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--r-xl, 16px);
      padding: 16px;
    }
    .routine-top-main {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .back-circle-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s ease;
      flex-shrink: 0;
    }
    .back-circle-btn:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    .routine-title-block {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .routine-title-input {
      background: transparent;
      border: none;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
      color: var(--text);
      font-size: 1.25rem;
      font-weight: 800;
      padding: 2px 0;
      outline: none;
      width: 100%;
      transition: border-color 0.2s;
    }
    .routine-title-input:focus {
      border-bottom-color: #22c55e;
    }
    .routine-subtitle {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .routine-presets-deck {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      padding-top: 4px;
    }
    .presets-lbl {
      font-size: 0.65rem;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.06em;
      flex-shrink: 0;
    }
    .presets-scroll {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
    }
    .preset-pill-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
      font-size: 0.7rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 9999px;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .preset-pill-btn.active, .preset-pill-btn:hover {
      background: rgba(34, 197, 94, 0.15);
      border-color: #22c55e;
      color: #86efac;
    }

    /* Progression Banner Card (Screenshot 3 & 4) */
    .progression-banner-card {
      background: #111722;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--r-xl, 16px);
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .progression-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .prog-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .prog-icon-badge {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(34, 197, 94, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .prog-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 8px;
    }
    .prog-label {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text);
    }
    .prog-select {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.85rem;
      font-weight: 500;
      outline: none;
      cursor: pointer;
    }
    .prog-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .prog-toggle-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .prog-pause-badge {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      flex-shrink: 0;
    }
    .prog-toggle-text {
      display: flex;
      flex-direction: column;
    }
    .prog-toggle-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text);
    }
    .prog-toggle-sub {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .prog-footer-note {
      font-size: 0.72rem;
      color: #64748b;
      font-style: italic;
    }

    /* Switch */
    .apex-switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
    }
    .apex-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .switch-slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #27303f;
      transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 24px;
    }
    .switch-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 50%;
    }
    .apex-switch input:checked + .switch-slider {
      background-color: #22c55e;
    }
    .apex-switch input:checked + .switch-slider:before {
      transform: translateX(20px);
    }

    /* Exercises Section (Screenshots 3 & 4) */
    .routine-exercises-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .routine-sec-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }
    .routine-sec-header h3 {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--text);
      margin: 0;
    }
    .sec-hint {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    .routine-exercises-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* Superset Connector */
    .superset-connector-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      background: rgba(34, 197, 94, 0.12);
      border-left: 3px solid #22c55e;
      border-radius: 0 8px 8px 0;
      margin-left: 20px;
      width: fit-content;
    }
    .conn-icon {
      font-size: 0.75rem;
    }
    .conn-text {
      font-size: 0.62rem;
      font-weight: 800;
      color: #86efac;
      letter-spacing: 0.05em;
    }

    .routine-ex-card {
      background: #111620;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: var(--r-xl, 14px);
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: border-color 0.2s ease, transform 0.2s ease;
    }
    .routine-ex-card.is-superset-child {
      border-left: 3px solid #22c55e;
      background: #0d151e;
    }
    .ex-thumb-box {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: #192230;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .ex-card-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .ex-thumb-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ex-info-col {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ex-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .routine-ex-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ex-target-muscle {
      font-size: 0.65rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
      color: #94a3b8;
      padding: 1px 6px;
      border-radius: 6px;
    }
    .ex-reps-target-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .target-reps-pill {
      font-size: 0.75rem;
      font-weight: 700;
      color: #86efac;
      background: rgba(34, 197, 94, 0.12);
      padding: 2px 7px;
      border-radius: 6px;
    }
    .target-weight-pill, .bw-pill {
      font-size: 0.72rem;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.04);
      padding: 2px 6px;
      border-radius: 6px;
    }
    .intensifier-pill {
      font-size: 0.65rem;
      font-weight: 700;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.15);
      padding: 1px 6px;
      border-radius: 6px;
    }
    .ex-actions-col {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .ex-action-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .ex-action-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text);
    }
    .ex-action-btn.link-btn.active {
      background: #22c55e;
      color: #052e16;
      border-color: #4ade80;
    }
    .reorder-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .reorder-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.65rem;
      cursor: pointer;
      padding: 1px 4px;
      line-height: 1;
      border-radius: 4px;
    }
    .reorder-btn:hover:not(:disabled) {
      color: var(--text);
      background: rgba(255, 255, 255, 0.08);
    }
    .reorder-btn:disabled {
      opacity: 0.25;
      cursor: not-allowed;
    }

    /* What this session hits card */
    .what-session-hits-card {
      background: #0f141d;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--r-xl, 16px);
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .hits-title-block h3 {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text);
      margin: 0;
    }
    .hits-title-block p {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 3px;
    }
    .superset-hint-box {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 10px 14px;
      border-radius: 10px;
    }
    .hint-chain {
      font-size: 0.9rem;
    }
    .routine-cta-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      margin-top: 6px;
    }
    .btn-add-exercise {
      background: #22c55e !important;
      color: #052e16 !important;
      font-weight: 800 !important;
      font-size: 0.95rem;
      border: none;
      padding: 14px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(34, 197, 94, 0.35);
      transition: all 0.2s ease;
    }
    .btn-add-exercise:hover {
      background: #16a34a !important;
      transform: translateY(-1px);
    }
    .copy-routine-btn {
      color: #86efac !important;
      border-color: rgba(34, 197, 94, 0.3) !important;
      padding: 10px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .start-routine-btn {
      font-size: 0.95rem;
      padding: 14px;
      border-radius: 12px;
      font-weight: 700;
    }

    /* Customizer Drawer (Screenshot 1) */
    .customizer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 100;
      display: flex;
      justify-content: flex-end;
    }
    .customizer-drawer {
      width: 100%;
      max-width: 440px;
      background: #111722;
      height: 100vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      box-shadow: -8px 0 32px rgba(0, 0, 0, 0.6);
      animation: slide-drawer 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slide-drawer {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .drawer-header {
      padding: 18px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      position: sticky;
      top: 0;
      background: #111722;
      z-index: 10;
    }
    .drawer-sub {
      font-size: 0.65rem;
      font-weight: 800;
      color: #22c55e;
      letter-spacing: 0.08em;
    }
    .drawer-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text);
      margin: 4px 0 2px;
    }
    .drawer-desc {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0;
    }
    .drawer-close-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .drawer-body {
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }
    .drawer-card {
      background: #161e2c;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .drawer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .row-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .row-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .row-icon-box.green {
      background: rgba(34, 197, 94, 0.15);
    }
    .row-icon-box.blue {
      background: rgba(56, 189, 248, 0.15);
    }
    .row-text {
      display: flex;
      flex-direction: column;
    }
    .row-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text);
    }
    .row-sub {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .stepper-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .stepper-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: #94a3b8;
    }
    .stepper-sub-lbl {
      font-size: 0.72rem;
      color: #64748b;
      font-weight: 600;
    }
    .stepper-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #0f141e;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 6px 10px;
    }
    .stepper-btn {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      border: none;
      color: var(--text);
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stepper-btn:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    .stepper-val {
      font-size: 1rem;
      font-weight: 800;
      color: var(--text);
    }
    .stepper-hint {
      font-size: 0.7rem;
      color: #64748b;
      line-height: 1.35;
    }
    .selector-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .selector-key {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text);
    }
    .drawer-select {
      background: transparent;
      border: none;
      color: #22c55e;
      font-size: 0.85rem;
      font-weight: 600;
      outline: none;
      text-align: right;
    }
    .drawer-textarea {
      background: #0f141e;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 8px 10px;
      color: var(--text);
      font-size: 0.8rem;
      resize: vertical;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }
    .drawer-footer {
      padding: 16px 20px calc(16px + env(safe-area-inset-bottom, 0));
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      position: sticky;
      bottom: 0;
      background: #111722;
    }

    /* Routine Add Modal */
    .routine-add-modal {
      width: 92%;
      max-width: 520px;
      max-height: 85vh;
      background: #111722;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      margin: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7);
    }
    .modal-search-row {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #0b1016;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 10px 14px;
    }
    .modal-search-input {
      background: transparent;
      border: none;
      color: var(--text);
      font-size: 0.85rem;
      width: 100%;
      outline: none;
    }
    .modal-cat-pills {
      display: flex;
      gap: 6px;
      overflow-x: auto;
    }
    .cat-chip {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
      font-size: 0.72rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 9999px;
      cursor: pointer;
      white-space: nowrap;
    }
    .cat-chip.active {
      background: #22c55e;
      color: #052e16;
      border-color: #4ade80;
    }
    .modal-exercises-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 380px;
      overflow-y: auto;
    }
    .modal-ex-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: #161e2c;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 10px 12px;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .modal-ex-item:hover {
      background: #1d2738;
      border-color: rgba(34, 197, 94, 0.3);
    }
    .item-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .item-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text);
    }
    .item-meta {
      display: flex;
      gap: 6px;
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    .item-muscle {
      color: #86efac;
    }
    @media (max-width: 600px) {
      .routine-top-main {
        flex-direction: column;
        align-items: flex-start;
      }
      .customizer-drawer {
        max-width: 100vw;
      }
    }
  `]
})
export class TrainingHubComponent implements OnInit {
  workout = inject(WorkoutService);
  nutrition = inject(NutritionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected Math = Math;

  activeTab = signal<'calendar' | 'library' | 'routine'>('calendar');
  inspectorTab = signal<'all' | 'workouts' | 'meals' | 'water'>('all');
  showJustFinishedBanner = signal<boolean>(false);
  showAddedToast = signal<string | null>(null);
  showGuide = signal<boolean>(true);

  // Computed Biomechanical Target Muscles for Calendar View Banner
  sessionTargetMuscles = computed(() => {
    const deck = this.activeExercisesDeck();
    if (!deck || deck.length === 0) return ['quads', 'hamstrings', 'glutes'];
    return deck.map(d => d.muscle);
  });

  // Routine & Muscle Heatmap Designer State (Matching reference screenshots)
  routineName = signal<string>('Chest Day');
  routineProgression = signal<string>('Linear progression');
  excludeFromProgression = signal<boolean>(false);
  routinePresets = [
    'Chest Day',
    'Lower Body Quad & Glute Power',
    'Pull & Upper Back Hypertrophy',
    'All Fours & Core Mobility',
    'Total Body Athletic Engine'
  ];

  routineExercises = signal<RoutineItem[]>([
    {
      id: 'band-bench-press',
      name: 'Band Bench Press',
      muscle: 'Chest',
      secondaryMuscles: ['Shoulders', 'Triceps'],
      targetSets: 3,
      targetReps: 10,
      targetWeightKg: 0,
      image: '/img/ex-bench-press.jpg',
      isSuperset: false,
      isBodyweight: false,
      repsPerSide: false,
      addedWeightKg: 0,
      topOfRange: 12,
      intensifier: 'None',
      progressionRule: 'Follow the routine (Linear progression)',
      stepKg: 2.5,
      notes: 'Loop resistance band across upper back.'
    },
    {
      id: 'archer-push-up',
      name: 'Archer Push Up',
      muscle: 'Chest',
      secondaryMuscles: ['Shoulders', 'Core'],
      targetSets: 3,
      targetReps: 10,
      targetWeightKg: 0,
      image: '/img/ex-overhead-press.jpg',
      isSuperset: true, // superset with Band Bench Press (screenshot 3)
      isBodyweight: true,
      repsPerSide: true,
      addedWeightKg: 0,
      topOfRange: 12,
      intensifier: 'None',
      progressionRule: 'Follow the routine (Linear progression)',
      stepKg: 0,
      notes: 'Slide non-working hand outwards smoothly.'
    },
    {
      id: 'barbell-bench-press',
      name: 'Barbell Bench Press',
      muscle: 'Chest',
      secondaryMuscles: ['Shoulders', 'Triceps'],
      targetSets: 3,
      targetReps: 10,
      targetWeightKg: 95,
      image: '/img/ex-bench-press.jpg',
      isSuperset: false,
      isBodyweight: false,
      repsPerSide: false,
      addedWeightKg: 0,
      topOfRange: 10,
      intensifier: 'None',
      progressionRule: 'Follow the routine (Linear progression)',
      stepKg: 2.5,
      notes: 'Pinch shoulder blades, drive feet into floor.'
    },
    {
      id: 'db-incline-press',
      name: 'Dumbbell Incline Alternate Press',
      muscle: 'Chest',
      secondaryMuscles: ['Shoulders', 'Triceps'],
      targetSets: 3,
      targetReps: 10,
      targetWeightKg: 32,
      image: '/img/ex-incline-press.jpg',
      isSuperset: true, // superset with Barbell Bench Press (screenshot 3)
      isBodyweight: false,
      repsPerSide: true,
      addedWeightKg: 0,
      topOfRange: 12,
      intensifier: 'Drop-set',
      progressionRule: 'Follow the routine (Linear progression)',
      stepKg: 2,
      notes: '30 degree incline, alternate left and right press.'
    },
    {
      id: 'overhead-press',
      name: 'Overhead Barbell Press',
      muscle: 'Shoulders',
      secondaryMuscles: ['Triceps', 'Upper Back'],
      targetSets: 3,
      targetReps: 8,
      targetWeightKg: 55,
      image: '/img/ex-overhead-press.jpg',
      isSuperset: false,
      isBodyweight: false,
      repsPerSide: false,
      addedWeightKg: 0,
      topOfRange: 10,
      intensifier: 'None',
      progressionRule: 'Follow the routine (Linear progression)',
      stepKg: 2.5,
      notes: 'Tight glutes and abdominal brace.'
    },
    {
      id: 'cable-pushdown',
      name: 'Cable Tricep Pushdown',
      muscle: 'Triceps',
      secondaryMuscles: ['Forearms'],
      targetSets: 3,
      targetReps: 12,
      targetWeightKg: 35,
      image: '/img/ex-tricep-pushdown.jpg',
      isSuperset: true,
      isBodyweight: false,
      repsPerSide: false,
      addedWeightKg: 0,
      topOfRange: 15,
      intensifier: 'Rest-pause',
      progressionRule: 'Follow the routine (Linear progression)',
      stepKg: 2.5,
      notes: 'Lock out elbows with a 1-second contraction.'
    }
  ]);

  routineActiveMuscles = computed(() => {
    const list = this.routineExercises();
    const muscles: string[] = [];
    list.forEach(item => {
      muscles.push(item.muscle);
      if (item.secondaryMuscles) {
        muscles.push(...item.secondaryMuscles);
      }
    });
    return muscles;
  });

  // Customizer Drawer State
  selectedCustomizerIndex = signal<number | null>(null);
  selectedCustomizerExercise = computed(() => {
    const idx = this.selectedCustomizerIndex();
    if (idx === null || idx < 0) return null;
    return this.routineExercises()[idx] || null;
  });

  // Add Exercise to Routine Modal State
  showRoutineAddModal = signal<boolean>(false);
  routineAddSearch = signal<string>('');
  routineAddCategory = signal<string>('All');

  filteredRoutineAddExercises = computed(() => {
    const list = this.workout.exerciseLibrary();
    const query = this.routineAddSearch().trim().toLowerCase();
    const cat = this.routineAddCategory();

    return list.filter(e => {
      const matchCat = cat === 'All' || e.category === cat;
      if (!matchCat) return false;
      if (!query) return true;
      return (
        e.name.toLowerCase().includes(query) ||
        e.muscle.toLowerCase().includes(query) ||
        (e.secondaryMuscles && e.secondaryMuscles.some(m => m.toLowerCase().includes(query)))
      );
    });
  });

  moveRoutineExerciseUp(index: number) {
    if (index <= 0) return;
    const arr = [...this.routineExercises()];
    const temp = arr[index];
    arr[index] = arr[index - 1];
    arr[index - 1] = temp;
    this.routineExercises.set(arr);
  }

  moveRoutineExerciseDown(index: number) {
    const arr = [...this.routineExercises()];
    if (index >= arr.length - 1) return;
    const temp = arr[index];
    arr[index] = arr[index + 1];
    arr[index + 1] = temp;
    this.routineExercises.set(arr);
  }

  toggleRoutineSuperset(index: number) {
    if (index <= 0) return;
    const arr = [...this.routineExercises()];
    arr[index] = {
      ...arr[index],
      isSuperset: !arr[index].isSuperset
    };
    this.routineExercises.set(arr);
  }

  removeRoutineExercise(index: number) {
    const arr = [...this.routineExercises()];
    arr.splice(index, 1);
    this.routineExercises.set(arr);
  }

  openExerciseCustomizer(index: number) {
    this.selectedCustomizerIndex.set(index);
  }

  closeExerciseCustomizer() {
    this.selectedCustomizerIndex.set(null);
  }

  updateCustomizerField<K extends keyof RoutineItem>(field: K, value: RoutineItem[K]) {
    const idx = this.selectedCustomizerIndex();
    if (idx === null || idx < 0) return;
    const arr = [...this.routineExercises()];
    arr[idx] = { ...arr[idx], [field]: value };
    this.routineExercises.set(arr);
  }

  adjustCustomizerNumber<K extends keyof RoutineItem>(field: K, delta: number, min: number = 0) {
    const idx = this.selectedCustomizerIndex();
    if (idx === null || idx < 0) return;
    const arr = [...this.routineExercises()];
    const currentVal = (arr[idx][field] as number) || 0;
    const newVal = Math.max(min, Math.round((currentVal + delta) * 10) / 10);
    arr[idx] = { ...arr[idx], [field]: newVal };
    this.routineExercises.set(arr);
  }

  openAddExerciseToRoutineModal() {
    this.showRoutineAddModal.set(true);
    this.routineAddSearch.set('');
    this.routineAddCategory.set('All');
  }

  addLibraryExerciseToRoutine(ex: ExerciseItem) {
    const newItem: RoutineItem = {
      id: ex.id + '-' + Date.now(),
      name: ex.name,
      muscle: ex.muscle,
      secondaryMuscles: ex.secondaryMuscles || [],
      targetSets: 3,
      targetReps: 10,
      targetWeightKg: ex.prKg || 50,
      image: ex.image,
      isSuperset: false,
      isBodyweight: ex.category?.toLowerCase() === 'mobility' || ex.category?.toLowerCase() === 'core',
      repsPerSide: false,
      addedWeightKg: 0,
      topOfRange: 12,
      intensifier: 'None',
      progressionRule: 'Follow the routine (Linear progression)',
      stepKg: 2.5,
      notes: ex.description || ''
    };
    this.routineExercises.set([...this.routineExercises(), newItem]);
    this.showRoutineAddModal.set(false);
    this.showAddedToast.set(`"${ex.name}" added to routine!`);
    setTimeout(() => this.showAddedToast.set(null), 4000);
  }

  selectPresetRoutine(name: string) {
    this.routineName.set(name);
    if (name.includes('Chest')) {
      this.routineExercises.set([
        {
          id: 'band-bench-press',
          name: 'Band Bench Press',
          muscle: 'Chest',
          secondaryMuscles: ['Shoulders', 'Triceps'],
          targetSets: 3,
          targetReps: 10,
          targetWeightKg: 0,
          image: '/img/ex-bench-press.jpg',
          isSuperset: false,
          isBodyweight: false,
          repsPerSide: false,
          addedWeightKg: 0,
          topOfRange: 12,
          intensifier: 'None',
          progressionRule: 'Follow the routine (Linear progression)',
          stepKg: 2.5,
          notes: 'Loop resistance band across upper back.'
        },
        {
          id: 'archer-push-up',
          name: 'Archer Push Up',
          muscle: 'Chest',
          secondaryMuscles: ['Shoulders', 'Core'],
          targetSets: 3,
          targetReps: 10,
          targetWeightKg: 0,
          image: '/img/ex-overhead-press.jpg',
          isSuperset: true,
          isBodyweight: true,
          repsPerSide: true,
          addedWeightKg: 0,
          topOfRange: 12,
          intensifier: 'None',
          progressionRule: 'Follow the routine (Linear progression)',
          stepKg: 0,
          notes: 'Slide non-working hand outwards smoothly.'
        },
        {
          id: 'barbell-bench-press',
          name: 'Barbell Bench Press',
          muscle: 'Chest',
          secondaryMuscles: ['Shoulders', 'Triceps'],
          targetSets: 3,
          targetReps: 10,
          targetWeightKg: 95,
          image: '/img/ex-bench-press.jpg',
          isSuperset: false,
          isBodyweight: false,
          repsPerSide: false,
          addedWeightKg: 0,
          topOfRange: 10,
          intensifier: 'None',
          progressionRule: 'Follow the routine (Linear progression)',
          stepKg: 2.5,
          notes: 'Pinch shoulder blades, drive feet into floor.'
        },
        {
          id: 'db-incline-press',
          name: 'Dumbbell Incline Alternate Press',
          muscle: 'Chest',
          secondaryMuscles: ['Shoulders', 'Triceps'],
          targetSets: 3,
          targetReps: 10,
          targetWeightKg: 32,
          image: '/img/ex-incline-press.jpg',
          isSuperset: true,
          isBodyweight: false,
          repsPerSide: true,
          addedWeightKg: 0,
          topOfRange: 12,
          intensifier: 'Drop-set',
          progressionRule: 'Follow the routine (Linear progression)',
          stepKg: 2,
          notes: '30 degree incline, alternate left and right press.'
        }
      ]);
    } else if (name.includes('Lower') || name.includes('Quad')) {
      this.routineExercises.set([
        {
          id: 'squat',
          name: 'Barbell Back Squat',
          muscle: 'Quads',
          secondaryMuscles: ['Glutes', 'Hamstrings'],
          targetSets: 4,
          targetReps: 8,
          targetWeightKg: 120,
          image: '/img/ex-back-squat.jpg',
          isSuperset: false,
          isBodyweight: false,
          repsPerSide: false,
          addedWeightKg: 0,
          topOfRange: 8,
          intensifier: 'None',
          progressionRule: 'Follow the routine (Linear progression)',
          stepKg: 5,
          notes: 'Drive through heels, knees track over toes.'
        },
        {
          id: 'rdl',
          name: 'Romanian Deadlift (RDL)',
          muscle: 'Hamstrings',
          secondaryMuscles: ['Glutes', 'Lower Back'],
          targetSets: 3,
          targetReps: 8,
          targetWeightKg: 95,
          image: '/img/ex-rdl.jpg',
          isSuperset: false,
          isBodyweight: false,
          repsPerSide: false,
          addedWeightKg: 0,
          topOfRange: 10,
          intensifier: 'None',
          progressionRule: 'Follow the routine (Linear progression)',
          stepKg: 2.5,
          notes: 'Hinge hips backwards with flat spine.'
        },
        {
          id: 'bulgarian',
          name: 'Bulgarian Split Squat',
          muscle: 'Quads & Glutes',
          secondaryMuscles: ['Hamstrings', 'Calves'],
          targetSets: 3,
          targetReps: 10,
          targetWeightKg: 22,
          image: '/img/ex-back-squat.jpg',
          isSuperset: true,
          isBodyweight: false,
          repsPerSide: true,
          addedWeightKg: 0,
          topOfRange: 12,
          intensifier: 'Drop-set',
          progressionRule: 'Follow the routine (Linear progression)',
          stepKg: 2,
          notes: 'Elevate rear foot on bench.'
        },
        {
          id: 'calves',
          name: 'Standing Calf Raise',
          muscle: 'Calves',
          secondaryMuscles: [],
          targetSets: 3,
          targetReps: 15,
          targetWeightKg: 80,
          image: '/img/ex-rdl.jpg',
          isSuperset: false,
          isBodyweight: false,
          repsPerSide: false,
          addedWeightKg: 0,
          topOfRange: 20,
          intensifier: 'Rest-pause',
          progressionRule: 'Follow the routine (Linear progression)',
          stepKg: 5,
          notes: '2-second pause at full peak stretch.'
        }
      ]);
    } else if (name.includes('All Fours') || name.includes('Mobility')) {
      this.routineExercises.set([
        {
          id: 'squad-stretch',
          name: 'All Fours Squad Stretch',
          muscle: 'Quads',
          secondaryMuscles: ['Glutes', 'Hamstrings'],
          targetSets: 3,
          targetReps: 10,
          targetWeightKg: 0,
          image: '/img/ex-back-squat.jpg',
          isSuperset: false,
          isBodyweight: true,
          repsPerSide: true,
          addedWeightKg: 0,
          topOfRange: 12,
          intensifier: 'None',
          progressionRule: 'Follow the routine (Linear progression)',
          stepKg: 0,
          notes: 'Active hip flexor & quad lengthening.'
        },
        {
          id: 'situp',
          name: '3/4 Sit-Up',
          muscle: 'Abs & Core',
          secondaryMuscles: ['Hip Flexors'],
          targetSets: 3,
          targetReps: 12,
          targetWeightKg: 0,
          image: '/img/ex-overhead-press.jpg',
          isSuperset: true,
          isBodyweight: true,
          repsPerSide: false,
          addedWeightKg: 0,
          topOfRange: 15,
          intensifier: 'None',
          progressionRule: 'Follow the routine (Linear progression)',
          stepKg: 0,
          notes: 'Engage rectus abdominis without pulling neck.'
        }
      ]);
    }
  }

  copyCurrentRoutine() {
    this.showAddedToast.set(`Routine "${this.routineName()}" copied to clipboard!`);
    setTimeout(() => this.showAddedToast.set(null), 3000);
  }

  startLiveWorkoutFromRoutine() {
    const exercises = this.routineExercises();
    if (exercises.length > 0) {
      this.workout.liveSession.update(curr => ({
        ...curr,
        isActive: true,
        sessionTitle: this.routineName(),
        exercises: exercises.map(item => {
          const libMatch = this.workout.exerciseLibrary().find(l => l.name.toLowerCase() === item.name.toLowerCase());
          const exercise: ExerciseItem = libMatch ? { ...libMatch } : {
            id: item.id,
            name: item.name,
            muscle: item.muscle,
            secondaryMuscles: item.secondaryMuscles || [],
            category: 'Strength',
            image: item.image || '/img/ex-bench-press.jpg',
            lastPerformance: `${item.targetWeightKg || 50}kg × ${item.targetReps}`,
            targetSetsReps: `${item.targetSets} × ${item.targetReps}`,
            prKg: item.targetWeightKg || 60,
            equipment: 'Free Weight / Bodyweight',
            description: item.notes || 'Custom configured routine exercise.',
            formCues: item.notes ? [item.notes] : ['Control tempo and maintain spinal stability.']
          };
          return {
            exercise,
            targetSets: item.targetSets,
            targetReps: item.targetReps,
            sets: Array.from({ length: item.targetSets }, (_, i) => ({
              setNumber: i + 1,
              weightKg: item.targetWeightKg || 60,
              reps: item.targetReps,
              completed: false,
              isWarmup: i === 0 && item.targetSets > 3
            }))
          };
        })
      }));
    }
    this.router.navigate(['/training/session/live']);
  }

  inspectExerciseByName(exerciseName: string) {
    const found = this.workout.exerciseLibrary().find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
    if (found) {
      this.selectedExercise.set(found);
    }
  }

  // Real-time Date & Calendar State
  viewDate = signal<Date>(new Date());
  selectedDateStr = signal<string>(new Date().toISOString().split('T')[0]);
  todayStr = new Date().toISOString().split('T')[0];

  selectedTimeframe = signal<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');

  // Exercise Library Filters
  categories = ['All', 'Strength', 'Hypertrophy', 'Mobility', 'Core', 'HIIT'];
  selectedCategory = signal('All');
  searchQuery = '';
  selectedExercise = signal<ExerciseItem | null>(null);

  // Modal State
  showAddModal = signal<boolean>(false);
  newSessionDate = this.todayStr;
  newSessionTitle = 'Lower Body Strength';
  newSessionMode: 'planned' | 'completed' = 'planned';
  newSessionExercises: LoggedExerciseItem[] = [];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'library') {
        this.activeTab.set('library');
      } else if (params['tab'] === 'routine') {
        this.activeTab.set('routine');
      } else {
        this.activeTab.set('calendar');
      }
      if (params['justFinished'] === 'true') {
        this.showJustFinishedBanner.set(true);
      }
    });
  }

  // Athlete Progression & Achievements State
  athleteLevel = signal<number>(14);
  athleteXp = signal<number>(3150);
  nextLevelXp = signal<number>(4000);
  activeStreakDays = signal<number>(5);
  selectedAchievement = signal<any | null>(null);

  achievements = signal([
    {
      id: 'tonnage-100k',
      icon: '🏆',
      title: '100k Club',
      desc: 'Lifted 100,000+ kg lifetime volume across barbell & compound lifts.',
      stat: '142,500 kg',
      unlocked: true,
      xp: '+500 XP',
      date: 'Unlocked Oct 14'
    },
    {
      id: 'streak-5',
      icon: '🔥',
      title: 'Iron Consistency',
      desc: 'Logged 5 consecutive scheduled training sessions without missing.',
      stat: '5-Day Streak',
      unlocked: true,
      xp: '+300 XP',
      date: 'Active Streak'
    },
    {
      id: 'pr-smasher',
      icon: '⚡',
      title: 'PR Smasher',
      desc: 'Smashed personal record on Back Squat with 140 kg 1RM estimation.',
      stat: 'Squat 140 kg',
      unlocked: true,
      xp: '+450 XP',
      date: 'New PR Set'
    },
    {
      id: 'iron-recovery',
      icon: '🛡️',
      title: 'Iron Recovery',
      desc: 'Maintained 85%+ readiness score for 3 consecutive training cycles.',
      stat: '88% Avg Readiness',
      unlocked: true,
      xp: '+250 XP',
      date: 'Unlocked Oct 12'
    },
    {
      id: 'centurion',
      icon: '🔒',
      title: 'Centurion Volume',
      desc: 'Complete 100 working sets in a single calendar month.',
      stat: '78 / 100 Sets',
      unlocked: false,
      xp: '+600 XP',
      date: '78% Complete'
    }
  ]);

  trainingPrograms = [
    {
      id: 'olympic',
      name: 'Olympic Strength & Hypertrophy',
      daysPerWeek: 4,
      split: 'Upper / Lower Conjugate',
      focus: 'Periodized Compound Strength & Kinetic Power'
    },
    {
      id: 'powerbuilding',
      name: 'Powerbuilding Progression',
      daysPerWeek: 5,
      split: 'Push / Pull / Legs + Weakpoint',
      focus: 'Mechanical Tension & Structural Density'
    },
    {
      id: 'athletic-engine',
      name: 'Athletic Engine & Hybrid',
      daysPerWeek: 4,
      split: 'Full Body Compound + Lactate Threshold',
      focus: 'VO2 Max, Power-to-Weight & Functional Capacity'
    },
    {
      id: 'mobility-reset',
      name: 'Mobility & Deload Active',
      daysPerWeek: 3,
      split: 'Full Body Mobility & Core Stability',
      focus: 'Tendon Remodeling & Central Nervous System Recovery'
    }
  ];

  activeProgram = signal<string>('Olympic Strength & Hypertrophy');

  switchProgram(programName: string) {
    this.activeProgram.set(programName);
    if (programName.includes('Powerbuilding')) {
      this.prescribedExercises = [
        { name: 'Barbell Bench Press', targetSets: 4, targetReps: 6, targetWeight: '95 kg', muscle: 'Chest' },
        { name: 'Incline Dumbbell Press', targetSets: 3, targetReps: 10, targetWeight: '32 kg DBs', muscle: 'Upper Chest' },
        { name: 'Overhead Barbell Press', targetSets: 3, targetReps: 8, targetWeight: '55 kg', muscle: 'Shoulders' },
        { name: 'Cable Tricep Pushdown', targetSets: 4, targetReps: 12, targetWeight: '35 kg', muscle: 'Triceps' }
      ];
    } else if (programName.includes('Athletic Engine')) {
      this.prescribedExercises = [
        { name: 'Conventional Barbell Deadlift', targetSets: 4, targetReps: 5, targetWeight: '145 kg', muscle: 'Posterior Chain' },
        { name: 'Kettlebell Russian Swings', targetSets: 4, targetReps: 15, targetWeight: '28 kg KB', muscle: 'Hips & Core' },
        { name: 'Pull-Ups (Weighted)', targetSets: 4, targetReps: 8, targetWeight: '+10 kg', muscle: 'Lats & Biceps' },
        { name: 'Walking Dumbbell Lunges', targetSets: 3, targetReps: 12, targetWeight: '20 kg DBs', muscle: 'Quads & Balance' }
      ];
    } else if (programName.includes('Mobility')) {
      this.prescribedExercises = [
        { name: 'Goblet Squat (Pause)', targetSets: 3, targetReps: 10, targetWeight: '24 kg KB', muscle: 'Hip Mobility & Quads' },
        { name: 'Hanging Leg Raises', targetSets: 3, targetReps: 12, targetWeight: 'Bodyweight', muscle: 'Anterior Core' },
        { name: 'Face Pulls with External Rotation', targetSets: 4, targetReps: 15, targetWeight: '20 kg Cable', muscle: 'Rear Delts & Rotators' },
        { name: 'Single-Leg RDL', targetSets: 3, targetReps: 10, targetWeight: '16 kg DB', muscle: 'Hamstrings & Stability' }
      ];
    } else {
      this.prescribedExercises = [
        { name: 'Barbell Back Squat', targetSets: 4, targetReps: 8, targetWeight: '120 kg', muscle: 'Quads' },
        { name: 'Romanian Deadlift (RDL)', targetSets: 3, targetReps: 8, targetWeight: '85 kg', muscle: 'Hamstrings' },
        { name: 'Bulgarian Split Squat', targetSets: 3, targetReps: 10, targetWeight: '22 kg DBs', muscle: 'Quads & Glutes' },
        { name: 'Standing Calf Raise', targetSets: 3, targetReps: 15, targetWeight: '80 kg', muscle: 'Calves' }
      ];
    }
  }

  prescribedExercises = [
    { name: 'Barbell Back Squat', targetSets: 4, targetReps: 8, targetWeight: '120 kg', muscle: 'Quads' },
    { name: 'Romanian Deadlift (RDL)', targetSets: 3, targetReps: 8, targetWeight: '85 kg', muscle: 'Hamstrings' },
    { name: 'Bulgarian Split Squat', targetSets: 3, targetReps: 10, targetWeight: '22 kg DBs', muscle: 'Quads & Glutes' },
    { name: 'Standing Calf Raise', targetSets: 3, targetReps: 15, targetWeight: '80 kg', muscle: 'Calves' }
  ];

  isTodayCompleted = computed(() => {
    return this.workout.completedSessions().some(s => s.date === this.todayStr);
  });

  onAddExerciseToToday(exercise: ExerciseItem) {
    this.workout.addExerciseToLiveSession(exercise);

    const exists = this.prescribedExercises.some(e => e.name.toLowerCase() === exercise.name.toLowerCase());
    if (!exists) {
      this.prescribedExercises.push({
        name: exercise.name,
        targetSets: 3,
        targetReps: 10,
        targetWeight: `${exercise.prKg || 60} kg`,
        muscle: exercise.muscle
      });
    }

    this.selectedExercise.set(null);
    this.activeTab.set('calendar');
    this.showAddedToast.set(`"${exercise.name}" added to Today's Workout!`);
    setTimeout(() => this.showAddedToast.set(null), 5000);
  }

  todaySessions = computed(() => {
    return this.workout.getSessionsForDate(this.todayStr);
  });

  todaySessionVolume = computed(() => {
    return this.todaySessions().reduce((sum, s) => sum + s.totalVolumeKg, 0);
  });

  todaySessionSets = computed(() => {
    return this.todaySessions().reduce((sum, s) => sum + s.totalSets, 0);
  });

  currentMonthName = computed(() => {
    return this.viewDate().toLocaleDateString([], { month: 'long' });
  });

  currentYear = computed(() => {
    return this.viewDate().getFullYear();
  });

  formattedSelectedDate = computed(() => {
    const parts = this.selectedDateStr().split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  });

  selectedDaySessions = computed(() => {
    return this.workout.getSessionsForDate(this.selectedDateStr());
  });

  selectedDayMeals = computed(() => {
    return this.nutrition.getMealsForDate(this.selectedDateStr());
  });

  selectedDayNutrients = computed(() => {
    return this.nutrition.getNutrientsForDate(this.selectedDateStr());
  });

  selectedDayWater = computed(() => {
    return this.nutrition.getWaterForDate(this.selectedDateStr());
  });

  selectedDayVolume = computed(() => {
    return this.selectedDaySessions().reduce((sum, s) => sum + s.totalVolumeKg, 0);
  });

  selectedDaySets = computed(() => {
    return this.selectedDaySessions().reduce((sum, s) => sum + s.totalSets, 0);
  });

  isSelectedDateToday = computed(() => {
    return this.selectedDateStr() === this.todayStr;
  });

  isTomorrow = computed(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return this.selectedDateStr() === `${y}-${m}-${d}`;
  });

  isYesterday = computed(() => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return this.selectedDateStr() === `${y}-${m}-${d}`;
  });

  isSelectedDateFuture = computed(() => {
    return this.selectedDateStr() > this.todayStr;
  });

  isSelectedDatePast = computed(() => {
    return this.selectedDateStr() < this.todayStr;
  });

  primarySession = computed(() => {
    const sessions = this.selectedDaySessions();
    return sessions.length > 0 ? sessions[0] : null;
  });

  isSelectedDayCompleted = computed(() => {
    return this.selectedDaySessions().some(s => s.isCompleted !== false);
  });

  hasSelectedDayPlanned = computed(() => {
    return this.selectedDaySessions().some(s => s.isCompleted === false);
  });

  selectedDayStatusLabel = computed(() => {
    if (this.isSelectedDateToday()) return '🟢 LIVE TODAY';
    if (this.isTomorrow()) return "🔮 TOMORROW'S PLAN";
    if (this.isSelectedDateFuture()) return '📅 UPCOMING SCHEDULE';
    return '🕒 HISTORICAL RECORD';
  });

  bannerBadge = computed(() => {
    const primary = this.primarySession();
    if (primary) {
      if (primary.isCompleted === false) {
        if (this.isSelectedDateToday()) return "TODAY'S WORKOUT · READY TO START ⚡";
        if (this.isTomorrow()) return "TOMORROW'S WORKOUT SCHEDULED ⚡";
        if (this.isSelectedDateFuture()) return "FUTURE WORKOUT SCHEDULED ⚡";
        return "SCHEDULED WORKOUT (UNCOMPLETED)";
      } else {
        if (this.isSelectedDateToday()) return "TODAY'S WORKOUT COMPLETED ✓";
        if (this.isTomorrow()) return "TOMORROW'S WORKOUT LOGGED ✓";
        if (this.isSelectedDateFuture()) return "FUTURE WORKOUT LOGGED ✓";
        return "WORKOUT COMPLETED ✓";
      }
    }

    if (this.isSelectedDateToday()) {
      return this.isTodayCompleted() ? "TODAY'S WORKOUT COMPLETED ✓" : "TODAY'S PLAN";
    }
    if (this.isTomorrow()) {
      return "TOMORROW'S UPCOMING PLAN";
    }
    if (this.isSelectedDateFuture()) {
      return "UPCOMING SCHEDULE";
    }
    // Past date
    return "REST & RECOVERY DAY";
  });

  bannerTitle = computed(() => {
    const primary = this.primarySession();
    if (primary) {
      return primary.isCompleted === false
        ? `${primary.title} (Scheduled)`
        : `${primary.title} Logged`;
    }
    if (this.isSelectedDateToday()) {
      return 'Lower Body Strength';
    }
    if (this.isTomorrow()) {
      return 'Upper Body Push & Power';
    }
    if (this.isSelectedDateFuture()) {
      return 'Scheduled Athletic Session';
    }
    return 'Rest & Active Recovery';
  });

  bannerSubtitle = computed(() => {
    const primary = this.primarySession();
    if (primary) {
      const isCompleted = primary.isCompleted !== false;
      const count = primary.exercisesCount || primary.exercises?.length || 4;
      if (isCompleted) {
        const vol = this.selectedDayVolume();
        const sets = this.selectedDaySets();
        return `${count} exercises recorded into daily history · Total Volume: ${vol.toLocaleString()} kg (${sets} sets)`;
      } else {
        return `${count} exercises scheduled · Ready for live workout tracking or quick completion`;
      }
    }
    if (this.isSelectedDateToday()) {
      return '4 exercises prescribed · ~45 min target duration · Barbell & Dumbbells';
    }
    if (this.isTomorrow()) {
      return 'Upcoming planned session for tomorrow · Prescribed from ' + this.activeProgram();
    }
    if (this.isSelectedDateFuture()) {
      return 'Upcoming scheduled session · Prescribed from ' + this.activeProgram();
    }
    return `No training recorded for ${this.formattedSelectedDate()} · Neuromuscular recovery active`;
  });

  activeExercisesDeck = computed(() => {
    const primary = this.primarySession();
    if (primary) {
      const isCompleted = primary.isCompleted !== false;
      if (primary.exercises && primary.exercises.length > 0) {
        return primary.exercises.map((e, idx) => ({
          num: `MOVE 0${idx + 1}`,
          name: e.exerciseName,
          muscle: e.muscle || 'Compound',
          meta: isCompleted
            ? `${e.sets?.length || 3} sets recorded · ${e.sets?.[0]?.weightKg || 80} kg`
            : `${e.sets?.length || 3} sets planned · Target ${e.sets?.[0]?.weightKg || 80} kg`,
          isCompleted: isCompleted,
          statusText: isCompleted ? '✓ Completed' : 'Ready to Start'
        }));
      }
      return [
        {
          num: 'MOVE 01',
          name: primary.title,
          muscle: 'Compound',
          meta: isCompleted
            ? `${primary.totalSets} sets · ${primary.totalVolumeKg.toLocaleString()} kg`
            : `${primary.exercisesCount || 1} exercises scheduled`,
          isCompleted: isCompleted,
          statusText: isCompleted ? '✓ Completed' : 'Ready to Start'
        }
      ];
    }

    if (this.isSelectedDateToday()) {
      const completed = this.isTodayCompleted();
      return this.prescribedExercises.map((e, idx) => ({
        num: `MOVE 0${idx + 1}`,
        name: e.name,
        muscle: e.muscle,
        meta: `${e.targetSets} sets × ${e.targetReps} reps · ${e.targetWeight}`,
        isCompleted: completed,
        statusText: completed ? '✓ Completed' : 'Prescribed'
      }));
    }

    if (this.isSelectedDateFuture()) {
      const hasSession = this.isSelectedDayCompleted();
      return this.prescribedExercises.map((e, idx) => ({
        num: `MOVE 0${idx + 1}`,
        name: e.name,
        muscle: e.muscle,
        meta: `${e.targetSets} sets × ${e.targetReps} reps · ${e.targetWeight}`,
        isCompleted: hasSession,
        statusText: hasSession ? '✓ Completed' : (this.isTomorrow() ? 'Upcoming' : 'Scheduled')
      }));
    }

    // Past date with no workouts (Rest Day)
    return [
      { num: 'RECOVERY 01', name: 'Neuromuscular Restoration', muscle: 'Systemic CNS', meta: 'Parasympathetic tone active', isCompleted: false, statusText: 'Rest Day' },
      { num: 'RECOVERY 02', name: 'Sarcomere Tissue Repair', muscle: 'All Muscles', meta: 'Myofibrillar protein remodeling', isCompleted: false, statusText: 'Rest Day' },
      { num: 'RECOVERY 03', name: 'Glycogen Replenishment', muscle: 'Metabolic', meta: 'Intracellular glycogen restored', isCompleted: false, statusText: 'Rest Day' },
      { num: 'RECOVERY 04', name: 'Deep Sleep & Endocrine Reset', muscle: 'Hormonal', meta: 'Slow-wave growth hormone pulse', isCompleted: false, statusText: 'Rest Day' }
    ];
  });

  adjustSelectedDayWater(delta: number) {
    this.nutrition.logWaterForDate(this.selectedDateStr(), delta);
  }

  calendarDays = computed<CalendarDay[]>(() => {
    const date = this.viewDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday as start of week: 0 for Mon, 6 for Sun
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: CalendarDay[] = [];
    const sessions = this.workout.completedSessions();

    // Trailing days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const dateStr = d.toISOString().split('T')[0];
      const matching = sessions.filter(s => s.date === dateStr);
      const matchingCompleted = matching.filter(s => s.isCompleted !== false);
      const matchingPlanned = matching.filter(s => s.isCompleted === false);
      const meals = this.nutrition.getMealsForDate(dateStr);
      const water = this.nutrition.getWaterForDate(dateStr);
      days.push({
        date: d,
        dateStr,
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: dateStr === this.todayStr,
        hasWorkouts: matchingCompleted.length > 0,
        workoutCount: matchingCompleted.length,
        hasPlanned: matchingPlanned.length > 0,
        plannedCount: matchingPlanned.length,
        totalVolumeKg: matchingCompleted.reduce((sum, s) => sum + s.totalVolumeKg, 0),
        hasMeals: meals.length > 0,
        mealCount: meals.length,
        totalKcal: meals.reduce((sum, m) => sum + (m.kcal || 0), 0),
        waterGlasses: water
      });
    }

    // Days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const matching = sessions.filter(s => s.date === dateStr);
      const matchingCompleted = matching.filter(s => s.isCompleted !== false);
      const matchingPlanned = matching.filter(s => s.isCompleted === false);
      const meals = this.nutrition.getMealsForDate(dateStr);
      const water = this.nutrition.getWaterForDate(dateStr);
      days.push({
        date: d,
        dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dateStr === this.todayStr,
        hasWorkouts: matchingCompleted.length > 0,
        workoutCount: matchingCompleted.length,
        hasPlanned: matchingPlanned.length > 0,
        plannedCount: matchingPlanned.length,
        totalVolumeKg: matchingCompleted.reduce((sum, s) => sum + s.totalVolumeKg, 0),
        hasMeals: meals.length > 0,
        mealCount: meals.length,
        totalKcal: meals.reduce((sum, m) => sum + (m.kcal || 0), 0),
        waterGlasses: water
      });
    }

    // Leading days of next month to complete 35 or 42 cells
    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dateStr = d.toISOString().split('T')[0];
      const matching = sessions.filter(s => s.date === dateStr);
      const matchingCompleted = matching.filter(s => s.isCompleted !== false);
      const matchingPlanned = matching.filter(s => s.isCompleted === false);
      const meals = this.nutrition.getMealsForDate(dateStr);
      const water = this.nutrition.getWaterForDate(dateStr);
      days.push({
        date: d,
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateStr === this.todayStr,
        hasWorkouts: matchingCompleted.length > 0,
        workoutCount: matchingCompleted.length,
        hasPlanned: matchingPlanned.length > 0,
        plannedCount: matchingPlanned.length,
        totalVolumeKg: matchingCompleted.reduce((sum, s) => sum + s.totalVolumeKg, 0),
        hasMeals: meals.length > 0,
        mealCount: meals.length,
        totalKcal: meals.reduce((sum, m) => sum + (m.kcal || 0), 0),
        waterGlasses: water
      });
    }

    return days;
  });

  trajectory = computed(() => {
    return this.workout.computeTrajectory(this.selectedTimeframe());
  });

  volumeHistory = computed(() => {
    return this.workout.getVolumeHistory(this.selectedTimeframe());
  });

  getBarHeightPct(volumeKg: number): number {
    const list = this.volumeHistory();
    const max = Math.max(...list.map(b => b.volumeKg), 1);
    return Math.max(12, Math.round((volumeKg / max) * 100));
  }

  selectDate(dateStr: string) {
    this.selectedDateStr.set(dateStr);
  }

  prevMonth() {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() - 1);
    this.viewDate.set(d);
  }

  nextMonth() {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() + 1);
    this.viewDate.set(d);
  }

  jumpToToday() {
    this.viewDate.set(new Date());
    this.selectedDateStr.set(this.todayStr);
  }

  deleteSession(id: string) {
    if (confirm('Delete this workout session from your history?')) {
      this.workout.deleteSession(id);
    }
  }

  // Add Session Modal Methods
  // Routine Presets for quick logging of all 4 exercises
  selectRoutinePreset(title: string) {
    this.newSessionTitle = title;
    if (title === 'Lower Body Strength') {
      this.newSessionExercises = [
        {
          exerciseId: 'back-squat',
          exerciseName: 'Barbell Back Squat',
          muscle: 'Quads',
          category: 'Strength',
          sets: [
            { setNumber: 1, weightKg: 100, reps: 8, completed: true, isWarmup: true },
            { setNumber: 2, weightKg: 120, reps: 8, completed: true },
            { setNumber: 3, weightKg: 125, reps: 8, completed: true },
            { setNumber: 4, weightKg: 125, reps: 8, completed: true }
          ]
        },
        {
          exerciseId: 'rdl',
          exerciseName: 'Romanian Deadlift (RDL)',
          muscle: 'Hamstrings',
          category: 'Strength',
          sets: [
            { setNumber: 1, weightKg: 80, reps: 10, completed: true },
            { setNumber: 2, weightKg: 95, reps: 10, completed: true },
            { setNumber: 3, weightKg: 100, reps: 8, completed: true }
          ]
        },
        {
          exerciseId: 'split-squat',
          exerciseName: 'Bulgarian Split Squat',
          muscle: 'Quads & Glutes',
          category: 'Hypertrophy',
          sets: [
            { setNumber: 1, weightKg: 20, reps: 10, completed: true },
            { setNumber: 2, weightKg: 24, reps: 10, completed: true },
            { setNumber: 3, weightKg: 24, reps: 10, completed: true }
          ]
        },
        {
          exerciseId: 'calf-raise',
          exerciseName: 'Standing Calf Raise',
          muscle: 'Calves',
          category: 'Hypertrophy',
          sets: [
            { setNumber: 1, weightKg: 60, reps: 15, completed: true },
            { setNumber: 2, weightKg: 70, reps: 15, completed: true },
            { setNumber: 3, weightKg: 75, reps: 12, completed: true }
          ]
        }
      ];
    } else if (title === 'Upper Body Push') {
      this.newSessionExercises = [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Barbell Bench Press',
          muscle: 'Chest',
          category: 'Strength',
          sets: [
            { setNumber: 1, weightKg: 70, reps: 8, completed: true, isWarmup: true },
            { setNumber: 2, weightKg: 85, reps: 8, completed: true },
            { setNumber: 3, weightKg: 90, reps: 6, completed: true },
            { setNumber: 4, weightKg: 95, reps: 5, completed: true }
          ]
        },
        {
          exerciseId: 'overhead-press',
          exerciseName: 'Standing Overhead Press',
          muscle: 'Shoulders',
          category: 'Strength',
          sets: [
            { setNumber: 1, weightKg: 45, reps: 8, completed: true },
            { setNumber: 2, weightKg: 50, reps: 8, completed: true },
            { setNumber: 3, weightKg: 55, reps: 6, completed: true }
          ]
        },
        {
          exerciseId: 'incline-db-press',
          exerciseName: 'Incline Dumbbell Press',
          muscle: 'Chest',
          category: 'Hypertrophy',
          sets: [
            { setNumber: 1, weightKg: 28, reps: 10, completed: true },
            { setNumber: 2, weightKg: 32, reps: 10, completed: true },
            { setNumber: 3, weightKg: 32, reps: 8, completed: true }
          ]
        },
        {
          exerciseId: 'tricep-pushdown',
          exerciseName: 'Cable Tricep Pushdown',
          muscle: 'Arms',
          category: 'Hypertrophy',
          sets: [
            { setNumber: 1, weightKg: 30, reps: 12, completed: true },
            { setNumber: 2, weightKg: 35, reps: 12, completed: true },
            { setNumber: 3, weightKg: 40, reps: 10, completed: true }
          ]
        }
      ];
    } else if (title === 'Back & Pull') {
      this.newSessionExercises = [
        {
          exerciseId: 'deadlift',
          exerciseName: 'Conventional Barbell Deadlift',
          muscle: 'Back & Glutes',
          category: 'Strength',
          sets: [
            { setNumber: 1, weightKg: 100, reps: 6, completed: true, isWarmup: true },
            { setNumber: 2, weightKg: 130, reps: 5, completed: true },
            { setNumber: 3, weightKg: 145, reps: 5, completed: true },
            { setNumber: 4, weightKg: 155, reps: 3, completed: true }
          ]
        },
        {
          exerciseId: 'barbell-row',
          exerciseName: 'Barbell Bent-Over Row',
          muscle: 'Back',
          category: 'Strength',
          sets: [
            { setNumber: 1, weightKg: 70, reps: 8, completed: true },
            { setNumber: 2, weightKg: 80, reps: 8, completed: true },
            { setNumber: 3, weightKg: 85, reps: 6, completed: true }
          ]
        },
        {
          exerciseId: 'lat-pulldown',
          exerciseName: 'Wide-Grip Lat Pulldown',
          muscle: 'Back',
          category: 'Hypertrophy',
          sets: [
            { setNumber: 1, weightKg: 65, reps: 10, completed: true },
            { setNumber: 2, weightKg: 70, reps: 10, completed: true },
            { setNumber: 3, weightKg: 75, reps: 8, completed: true }
          ]
        },
        {
          exerciseId: 'bicep-curl',
          exerciseName: 'Incline Dumbbell Curl',
          muscle: 'Arms',
          category: 'Hypertrophy',
          sets: [
            { setNumber: 1, weightKg: 14, reps: 12, completed: true },
            { setNumber: 2, weightKg: 16, reps: 10, completed: true },
            { setNumber: 3, weightKg: 16, reps: 10, completed: true }
          ]
        }
      ];
    } else {
      // Full Body Power
      this.newSessionExercises = [
        {
          exerciseId: 'back-squat',
          exerciseName: 'Barbell Back Squat',
          muscle: 'Quads',
          category: 'Strength',
          sets: [
            { setNumber: 1, weightKg: 100, reps: 8, completed: true },
            { setNumber: 2, weightKg: 120, reps: 6, completed: true },
            { setNumber: 3, weightKg: 125, reps: 6, completed: true }
          ]
        },
        {
          exerciseId: 'bench-press',
          exerciseName: 'Barbell Bench Press',
          muscle: 'Chest',
          category: 'Strength',
          sets: [
            { setNumber: 1, weightKg: 80, reps: 8, completed: true },
            { setNumber: 2, weightKg: 90, reps: 6, completed: true },
            { setNumber: 3, weightKg: 95, reps: 5, completed: true }
          ]
        },
        {
          exerciseId: 'deadlift',
          exerciseName: 'Conventional Barbell Deadlift',
          muscle: 'Back & Glutes',
          category: 'Strength',
          sets: [
            { setNumber: 1, weightKg: 130, reps: 5, completed: true },
            { setNumber: 2, weightKg: 140, reps: 5, completed: true },
            { setNumber: 3, weightKg: 150, reps: 3, completed: true }
          ]
        },
        {
          exerciseId: 'overhead-press',
          exerciseName: 'Standing Overhead Press',
          muscle: 'Shoulders',
          category: 'Strength',
          sets: [
            { setNumber: 1, weightKg: 50, reps: 8, completed: true },
            { setNumber: 2, weightKg: 55, reps: 6, completed: true },
            { setNumber: 3, weightKg: 60, reps: 5, completed: true }
          ]
        }
      ];
    }
  }

  openAddModal(dateStr: string) {
    this.newSessionDate = dateStr;
    this.newSessionMode = 'planned'; // Default to planned session so it doesn't auto-complete!
    this.selectRoutinePreset('Lower Body Strength');
    this.showAddModal.set(true);
  }

  addExerciseToNewSession() {
    const first = this.workout.exerciseLibrary()[0];
    this.newSessionExercises.push({
      exerciseId: first ? first.id : 'bench-press',
      exerciseName: first ? first.name : 'Barbell Bench Press',
      muscle: first ? first.muscle : 'Chest',
      category: first ? first.category : 'Strength',
      sets: [
        { setNumber: 1, weightKg: 80, reps: 8, completed: true }
      ]
    });
  }

  removeExerciseFromNewSession(index: number) {
    this.newSessionExercises.splice(index, 1);
  }

  onExerciseSelected(index: number, exerciseId: string) {
    const found = this.workout.exerciseLibrary().find(e => e.id === exerciseId);
    if (found && this.newSessionExercises[index]) {
      this.newSessionExercises[index].exerciseName = found.name;
      this.newSessionExercises[index].muscle = found.muscle;
      this.newSessionExercises[index].category = found.category;
    }
  }

  addSetToExercise(exIdx: number) {
    const ex = this.newSessionExercises[exIdx];
    if (ex) {
      const last = ex.sets[ex.sets.length - 1];
      ex.sets.push({
        setNumber: ex.sets.length + 1,
        weightKg: last ? last.weightKg : 80,
        reps: last ? last.reps : 8,
        completed: true
      });
    }
  }

  removeSet(exIdx: number, setIdx: number) {
    const ex = this.newSessionExercises[exIdx];
    if (ex && ex.sets.length > 1) {
      ex.sets.splice(setIdx, 1);
      ex.sets.forEach((s, i) => s.setNumber = i + 1);
    }
  }

  saveNewSession() {
    if (!this.newSessionTitle.trim()) return;
    const isCompleted = this.newSessionMode === 'completed';
    this.workout.logManualSession({
      title: this.newSessionTitle,
      date: this.newSessionDate,
      exercises: this.newSessionExercises,
      isCompleted
    });
    this.selectedDateStr.set(this.newSessionDate);
    this.showAddModal.set(false);
  }

  startSessionLive(sess: CompletedSessionItem) {
    this.workout.loadSessionIntoLive(sess);
    this.router.navigate(['/training/session/live']);
  }

  toggleSessionCompletion(sessionId: string) {
    this.workout.toggleSessionStatus(sessionId);
  }

  askCoachAboutTrend() {
    this.router.navigate(['/coach'], {
      queryParams: {
        prompt: `Can you analyze my training volume trend? Currently my status is ${this.trajectory().status} with ${this.trajectory().totalVolume} kg tonnage and ${this.trajectory().totalSets} sets.`
      }
    });
  }

  // Library Search & Filter
  filteredExercises = computed(() => {
    const cat = this.selectedCategory();
    const query = this.searchQuery.trim().toLowerCase();
    const list = this.workout.exerciseLibrary();

    return list.filter(e => {
      const matchesCategory = cat === 'All' || e.category === cat;
      if (!matchesCategory) return false;
      if (!query) return true;
      const inName = e.name.toLowerCase().includes(query);
      const inMuscle = e.muscle.toLowerCase().includes(query);
      const inEquip = e.equipment.toLowerCase().includes(query);
      const inSecondary = e.secondaryMuscles?.some(m => m.toLowerCase().includes(query));
      return inName || inMuscle || inEquip || inSecondary;
    });
  });

  openExercise(ex: ExerciseItem) {
    this.selectedExercise.set(ex);
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory.set('All');
  }
}
