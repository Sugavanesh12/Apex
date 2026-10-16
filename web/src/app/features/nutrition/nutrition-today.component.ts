import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { ProgressRingComponent } from '../../shared/ui/progress-ring/progress-ring.component';
import { MacroBarComponent } from '../../shared/ui/macro-bar/macro-bar.component';
import { NutritionService } from '../../core/services/nutrition.service';

@Component({
  selector: 'app-nutrition-today',
  standalone: true,
  imports: [RouterLink, DecimalPipe, IconComponent, ProgressRingComponent, MacroBarComponent],
  template: `
    <div class="nutrition-page">
      <!-- Header -->
      <header class="page-header">
        <div>
          <h2>Nutrition & Fuel</h2>
          <p class="sub">Intelligent macro tracking powered by food database verification.</p>
        </div>
        <a routerLink="/nutrition/scan" class="btn btn-primary scan-btn">
          <app-icon name="camera" [size]="16" />
          <span>Scan Meal Photo</span>
        </a>
      </header>

      <!-- Day Switcher Bar: Live Today vs Yesterday History -->
      <div class="day-switcher-bar card">
        <div class="day-tabs">
          <button
            class="day-tab-btn"
            [class.active]="selectedView() === 'today'"
            (click)="selectedView.set('today')"
          >
            <span class="live-pulse-dot"></span>
            <span>Live Today (Resets Daily)</span>
          </button>
          <button
            class="day-tab-btn"
            [class.active]="selectedView() === 'yesterday'"
            (click)="selectedView.set('yesterday')"
          >
            <span>Yesterday History</span>
          </button>
        </div>
        <div class="date-context-badge">
          <app-icon name="calendar" [size]="14" />
          <span>{{ formattedSelectedDate() }}</span>
          <a routerLink="/training" [queryParams]="{ tab: 'calendar' }" class="cal-shortcut-link" title="Open Training Calendar">
            Calendar →
          </a>
        </div>
      </div>

      <!-- Nutrition Status Cards -->
      <div class="nutrition-grid animated-fade-in">
        <!-- Energy & Macros Card -->
        <div class="card fuel-status-card">
          <div class="card-title-row">
            <div>
              <h3>Daily Energy Balance</h3>
              <span class="view-tag">{{ isViewingToday() ? 'Today (Live)' : 'Yesterday (Historical)' }}</span>
            </div>
            <span class="badge badge-primary">Target {{ nutrition.caloriesTarget() | number }} kcal</span>
          </div>

          <div class="ring-macros-split">
            <app-progress-ring
              [value]="displayedNutrients().kcal"
              [max]="nutrition.caloriesTarget()"
              [size]="150"
              [strokeWidth]="10"
              strokeColor="var(--primary)"
              label="Calories Target"
            >
              <span class="cal-large num">{{ displayedNutrients().kcal | number }}</span>
              <span class="cal-sub">of {{ nutrition.caloriesTarget() | number }} kcal</span>
            </app-progress-ring>

            <div class="macros-col">
              <app-macro-bar
                label="Protein"
                [current]="displayedNutrients().protein"
                [target]="nutrition.proteinTarget()"
                color="var(--macro-protein)"
                [height]="8"
              />
              <app-macro-bar
                label="Carbohydrates"
                [current]="displayedNutrients().carbs"
                [target]="nutrition.carbsTarget()"
                color="var(--macro-carbs)"
                [height]="8"
              />
              <app-macro-bar
                label="Dietary Fats"
                [current]="displayedNutrients().fat"
                [target]="nutrition.fatTarget()"
                color="var(--macro-fat)"
                [height]="8"
              />
            </div>
          </div>
        </div>

        <!-- Water & Hydration Card -->
        <div class="card water-card">
          <div class="card-title-row">
            <div>
              <h3>Hydration</h3>
              <span class="view-tag">{{ isViewingToday() ? 'Live Hydration' : 'Recorded Hydration' }}</span>
            </div>
            <span class="badge badge-cyan">{{ displayedWater() }} of {{ nutrition.waterTargetGlasses() }} Glasses</span>
          </div>

          <div class="glasses-row">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="glass-icon" [class.filled]="i <= displayedWater()">
                <app-icon name="water" [size]="24" />
              </div>
            }
          </div>

          <div class="water-actions">
            @if (isViewingToday()) {
              <button class="btn btn-secondary" (click)="nutrition.removeWaterGlass()" [disabled]="displayedWater() <= 0">- 1 Glass</button>
              <button class="btn btn-primary" (click)="nutrition.addWaterGlass()">+ 1 Glass (250ml)</button>
            } @else {
              <button class="btn btn-secondary" (click)="adjustWaterForDate(-1)" [disabled]="displayedWater() <= 0">- 1 Glass</button>
              <button class="btn btn-primary" (click)="adjustWaterForDate(1)">+ 1 Glass (250ml)</button>
            }
          </div>
        </div>
      </div>

      <!-- Real User Logged Meals Section -->
      <section class="meals-log-section">
        <div class="meals-header-row">
          <div>
            <h3>Logged Meals {{ isViewingToday() ? 'Today' : 'Yesterday' }}</h3>
            <span class="meals-sub">{{ isViewingToday() ? 'Live daily meal entries (resets every midnight)' : 'Preserved history from yesterday' }}</span>
          </div>
          <span class="meals-count-badge">{{ displayedMeals().length }} {{ displayedMeals().length === 1 ? 'Meal' : 'Meals' }}</span>
        </div>

        @if (displayedMeals().length === 0) {
          <!-- Empty State: Zero Mock Data -->
          <div class="empty-meals-card card animated-fade-in">
            <div class="empty-icon-box">
              <app-icon name="fuel" [size]="28" />
            </div>
            <div class="empty-text">
              <h4>No meals logged yet {{ isViewingToday() ? 'today' : 'for this date' }}</h4>
              <p>
                {{ isViewingToday()
                  ? 'Your day has reset cleanly. Snap a photo of your food or log your meal to track real-time calories & macronutrients.'
                  : 'No meal records found for this historical date.'
                }}
              </p>
            </div>
            <a routerLink="/nutrition/scan" class="btn btn-primary empty-scan-btn">
              <app-icon name="camera" [size]="16" />
              <span>Scan Food Photo</span>
            </a>
          </div>
        } @else {
          <!-- Real Logged Meals List -->
          <div class="meals-list animated-fade-in">
            @for (meal of displayedMeals(); track meal.id) {
              <div class="meal-card card">
                <img [src]="meal.image" [alt]="meal.name" class="meal-thumb" />
                <div class="meal-info">
                  <div class="meal-name-row">
                    <h4>{{ meal.name }}</h4>
                    <span class="meal-time">{{ meal.timestamp }}</span>
                  </div>
                  <div class="meal-nutrients num">
                    <span class="nut-item"><strong>{{ meal.kcal }}</strong> kcal</span>
                    <span class="nut-item">P: <strong>{{ meal.protein }}g</strong></span>
                    <span class="nut-item">C: <strong>{{ meal.carbs }}g</strong></span>
                    <span class="nut-item">F: <strong>{{ meal.fat }}g</strong></span>
                  </div>
                </div>
                <div class="meal-meta-col">
                  <span class="badge badge-primary">AI Verified</span>
                  <button class="remove-meal-btn" (click)="nutrition.removeMeal(meal.id)" title="Delete meal">
                    ✕
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .nutrition-page {
      max-width: 1200px;
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
    .page-header h2 {
      font-size: clamp(1.4rem, 2.4vw, 1.8rem);
    }
    .page-header .sub {
      color: var(--text-muted);
      font-size: var(--fs-sm);
      margin-top: 2px;
    }

    /* Day Switcher Bar */
    .day-switcher-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-3);
      padding: var(--s-3) var(--s-4);
      background: var(--surface-1);
      border: 1px solid var(--border-subtle);
      border-radius: var(--r-lg);
      flex-wrap: wrap;
    }
    .day-tabs {
      display: flex;
      align-items: center;
      gap: var(--s-2);
    }
    .day-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--surface-2);
      border: 1px solid var(--border-subtle);
      border-radius: var(--r-md);
      color: var(--text-muted);
      font-size: var(--fs-sm);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--t-fast);
    }
    .day-tab-btn:hover {
      color: var(--text-primary);
      border-color: var(--border-medium);
      background: var(--surface-3);
    }
    .day-tab-btn.active {
      background: rgba(16, 185, 129, 0.12);
      border-color: var(--primary);
      color: var(--primary);
      box-shadow: 0 0 16px rgba(16, 185, 129, 0.15);
    }
    .live-pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 8px var(--primary);
      animation: pulseLive 2s infinite ease-in-out;
    }
    @keyframes pulseLive {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }
    .date-context-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: var(--fs-sm);
      color: var(--text-secondary);
      background: var(--surface-2);
      padding: 6px 14px;
      border-radius: var(--r-full);
      border: 1px solid var(--border-subtle);
    }
    .cal-shortcut-link {
      color: var(--accent-1);
      text-decoration: none;
      font-weight: 600;
      margin-left: 4px;
      transition: color var(--t-fast);
    }
    .cal-shortcut-link:hover {
      color: var(--primary);
      text-decoration: underline;
    }

    .view-tag {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 2px;
      display: block;
    }

    .nutrition-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: var(--s-4);
    }

    .fuel-status-card, .water-card {
      padding: var(--s-5);
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }

    .card-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--s-3);
    }
    .card-title-row h3 {
      font-size: var(--fs-md);
      font-weight: 600;
    }

    .ring-macros-split {
      display: flex;
      align-items: center;
      gap: var(--s-5);
      flex-wrap: wrap;
    }

    .cal-large {
      font-size: 1.8rem;
      font-weight: 800;
      line-height: 1;
      color: var(--text-primary);
    }
    .cal-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .macros-col {
      flex: 1;
      min-width: 180px;
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }

    .glasses-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-2);
      padding: var(--s-3) 0;
    }
    .glass-icon {
      color: var(--text-subtle);
      transition: all var(--t-fast);
      transform: scale(0.95);
    }
    .glass-icon.filled {
      color: var(--accent-1);
      transform: scale(1.1);
      filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.4));
    }

    .water-actions {
      display: flex;
      gap: var(--s-2);
      margin-top: auto;
    }
    .water-actions .btn {
      flex: 1;
      justify-content: center;
    }

    /* Logged Meals Section */
    .meals-log-section {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .meals-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-3);
    }
    .meals-header-row h3 {
      font-size: var(--fs-md);
      font-weight: 600;
    }
    .meals-sub {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      display: block;
      margin-top: 2px;
    }
    .meals-count-badge {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--primary);
      background: rgba(16, 185, 129, 0.1);
      padding: 4px 10px;
      border-radius: var(--r-full);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    /* Empty state */
    .empty-meals-card {
      display: flex;
      align-items: center;
      gap: var(--s-4);
      padding: var(--s-6);
      border: 1px dashed var(--border-medium);
      background: var(--surface-1);
    }
    .empty-icon-box {
      width: 56px;
      height: 56px;
      border-radius: var(--r-lg);
      background: var(--surface-2);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .empty-text {
      flex: 1;
    }
    .empty-text h4 {
      font-size: var(--fs-base);
      font-weight: 600;
      margin-bottom: 4px;
    }
    .empty-text p {
      font-size: var(--fs-sm);
      color: var(--text-muted);
      max-width: 480px;
    }
    .empty-scan-btn {
      flex-shrink: 0;
    }

    /* Meals List */
    .meals-list {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .meal-card {
      display: flex;
      align-items: center;
      gap: var(--s-4);
      padding: var(--s-4);
      background: var(--surface-1);
      transition: all var(--t-fast);
    }
    .meal-card:hover {
      border-color: var(--border-medium);
      transform: translateY(-1px);
    }
    .meal-thumb {
      width: 68px;
      height: 68px;
      border-radius: var(--r-md);
      object-fit: cover;
      flex-shrink: 0;
      border: 1px solid var(--border-subtle);
    }
    .meal-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
      min-width: 0;
    }
    .meal-name-row {
      display: flex;
      align-items: baseline;
      gap: var(--s-3);
      flex-wrap: wrap;
    }
    .meal-name-row h4 {
      font-size: var(--fs-base);
      font-weight: 600;
    }
    .meal-time {
      font-size: var(--fs-xs);
      color: var(--text-muted);
    }
    .meal-nutrients {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      font-size: var(--fs-xs);
      color: var(--text-secondary);
      flex-wrap: wrap;
    }
    .nut-item strong {
      color: var(--text-primary);
    }

    .meal-meta-col {
      display: flex;
      align-items: center;
      gap: var(--s-3);
    }
    .remove-meal-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--r-full);
      background: transparent;
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--t-fast);
    }
    .remove-meal-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: var(--error);
      color: var(--error);
    }

    .animated-fade-in {
      animation: fadeInSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes fadeInSlideUp {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .nutrition-grid {
        grid-template-columns: 1fr;
      }
      .day-switcher-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      .day-tabs {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
      .day-tab-btn {
        justify-content: center;
      }
      .date-context-badge {
        width: 100%;
        justify-content: center;
      }
      .fuel-status-card, .water-card {
        padding: var(--s-3) var(--s-4);
      }
      .ring-macros-split {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
      }
      .empty-meals-card {
        flex-direction: column;
        text-align: center;
      }
    }

    @media (max-width: 500px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .scan-btn {
        width: 100%;
        justify-content: center;
      }
      .macros-col {
        min-width: 0;
        width: 100%;
      }
      .glasses-row {
        gap: 4px;
        overflow-x: auto;
      }
      .meal-card {
        padding: var(--s-3);
        gap: var(--s-3);
      }
      .meal-thumb {
        width: 56px;
        height: 56px;
      }
      .meal-nutrients {
        gap: 6px;
        font-size: 0.68rem;
      }
      .nutrition-page {
        padding-bottom: 28px;
      }
    }
  `]
})
export class NutritionTodayComponent {
  nutrition = inject(NutritionService);

  readonly selectedView = signal<'today' | 'yesterday'>('today');

  readonly todayStr = this.nutrition.getTodayDateStr();
  readonly yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  readonly displayedDateStr = computed(() => {
    return this.selectedView() === 'today' ? this.todayStr : this.yesterdayStr;
  });

  readonly isViewingToday = computed(() => this.selectedView() === 'today');

  readonly formattedSelectedDate = computed(() => {
    const dateStr = this.displayedDateStr();
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  });

  readonly displayedMeals = computed(() => {
    return this.nutrition.getMealsForDate(this.displayedDateStr());
  });

  readonly displayedNutrients = computed(() => {
    return this.nutrition.getNutrientsForDate(this.displayedDateStr());
  });

  readonly displayedWater = computed(() => {
    return this.nutrition.getWaterForDate(this.displayedDateStr());
  });

  adjustWaterForDate(delta: number) {
    this.nutrition.logWaterForDate(this.displayedDateStr(), delta);
  }
}
