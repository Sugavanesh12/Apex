import { Component, inject } from '@angular/core';
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

      <!-- Nutrition Status Cards -->
      <div class="nutrition-grid">
        <!-- Energy & Macros Card -->
        <div class="card fuel-status-card">
          <div class="card-title-row">
            <h3>Daily Energy Balance</h3>
            <span class="badge badge-primary">Target {{ nutrition.caloriesTarget() | number }} kcal</span>
          </div>

          <div class="ring-macros-split">
            <app-progress-ring
              [value]="nutrition.caloriesConsumed()"
              [max]="nutrition.caloriesTarget()"
              [size]="150"
              [strokeWidth]="10"
              strokeColor="var(--primary)"
              label="Calories Target"
            >
              <span class="cal-large num">{{ nutrition.caloriesConsumed() | number }}</span>
              <span class="cal-sub">of {{ nutrition.caloriesTarget() | number }} kcal</span>
            </app-progress-ring>

            <div class="macros-col">
              <app-macro-bar
                label="Protein"
                [current]="nutrition.proteinConsumed()"
                [target]="nutrition.proteinTarget()"
                color="var(--macro-protein)"
                [height]="8"
              />
              <app-macro-bar
                label="Carbohydrates"
                [current]="nutrition.carbsConsumed()"
                [target]="nutrition.carbsTarget()"
                color="var(--macro-carbs)"
                [height]="8"
              />
              <app-macro-bar
                label="Dietary Fats"
                [current]="nutrition.fatConsumed()"
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
            <h3>Hydration</h3>
            <span class="badge badge-cyan">{{ nutrition.waterGlasses() }} of {{ nutrition.waterTargetGlasses() }} Glasses</span>
          </div>

          <div class="glasses-row">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="glass-icon" [class.filled]="i <= nutrition.waterGlasses()">
                <app-icon name="water" [size]="24" />
              </div>
            }
          </div>

          <div class="water-actions">
            <button class="btn btn-secondary" (click)="nutrition.removeWaterGlass()" [disabled]="nutrition.waterGlasses() <= 0">- 1 Glass</button>
            <button class="btn btn-primary" (click)="nutrition.addWaterGlass()">+ 1 Glass (250ml)</button>
          </div>
        </div>
      </div>

      <!-- Real User Logged Meals Section -->
      <section class="meals-log-section">
        <div class="meals-header-row">
          <h3>Logged Meals Today</h3>
          <span class="meals-count-badge">{{ nutrition.loggedMeals().length }} {{ nutrition.loggedMeals().length === 1 ? 'Meal' : 'Meals' }}</span>
        </div>

        @if (nutrition.loggedMeals().length === 0) {
          <!-- Empty State: Zero Mock Data -->
          <div class="empty-meals-card card">
            <div class="empty-icon-box">
              <app-icon name="fuel" [size]="28" />
            </div>
            <div class="empty-text">
              <h4>No meals logged yet today</h4>
              <p>Snap a photo of your food or log your meal to track real-time calories & macronutrients.</p>
            </div>
            <a routerLink="/nutrition/scan" class="btn btn-primary empty-scan-btn">
              <app-icon name="camera" [size]="16" />
              <span>Scan Food Photo</span>
            </a>
          </div>
        } @else {
          <!-- Real Logged Meals List -->
          <div class="meals-list">
            @for (meal of nutrition.loggedMeals(); track meal.id) {
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
    .scan-btn {
      padding: 10px 24px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .nutrition-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--s-4);
    }
    .fuel-status-card {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .card-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .ring-macros-split {
      display: flex;
      align-items: center;
      gap: var(--s-6);
      padding: var(--s-2) 0;
    }
    .cal-large {
      font-family: var(--font-display);
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text);
      line-height: 1;
    }
    .cal-sub {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    .macros-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Water Card */
    .water-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--s-4);
    }
    .glasses-row {
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 6px;
      padding: var(--s-4) 0;
    }
    .glass-icon {
      color: var(--surface-3);
      transition: color var(--t-fast) var(--ease);
    }
    .glass-icon.filled {
      color: var(--accent-1);
    }
    .water-actions {
      display: flex;
      gap: var(--s-2);
    }
    .water-actions button {
      flex: 1;
    }

    /* Meals List */
    .meals-log-section {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .meals-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .meals-count-badge {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text-muted);
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 2px 10px;
    }

    /* Empty State Card */
    .empty-meals-card {
      display: flex;
      align-items: center;
      gap: var(--s-4);
      padding: var(--s-5);
      background: var(--surface-2);
      border: 1px dashed var(--border);
      border-radius: var(--r-card);
    }
    .empty-icon-box {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--surface);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      flex: 0 0 52px;
    }
    .empty-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .empty-text h4 {
      font-size: var(--fs-md);
      font-weight: 700;
      color: var(--text);
    }
    .empty-text p {
      font-size: var(--fs-xs);
      color: var(--text-muted);
    }
    .empty-scan-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
    }

    .meals-list {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .meal-card {
      display: flex;
      align-items: center;
      gap: var(--s-4);
      padding: var(--s-3) var(--s-4);
      border: 1px solid var(--border);
      transition: all 0.2s ease;
    }
    .meal-card:hover {
      border-color: var(--border-strong);
    }
    .meal-thumb {
      width: 72px;
      height: 72px;
      border-radius: var(--r-input);
      object-fit: cover;
      background: #000;
    }
    .meal-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .meal-name-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
      flex-wrap: wrap;
    }
    .meal-name-row h4 {
      font-size: var(--fs-md);
      font-weight: 700;
      color: var(--text);
    }
    .meal-time {
      font-size: var(--fs-xs);
      color: var(--text-faint);
    }
    .meal-nutrients {
      display: flex;
      gap: var(--s-3);
      font-size: var(--fs-xs);
      color: var(--text-muted);
      flex-wrap: wrap;
    }
    .nut-item strong {
      color: var(--text);
    }
    .meal-meta-col {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .remove-meal-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      transition: all 0.15s ease;
    }
    .remove-meal-btn:hover {
      color: #ef4444;
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    @media (max-width: 900px) {
      .nutrition-grid {
        grid-template-columns: 1fr;
      }
      .ring-macros-split {
        flex-direction: column;
        align-items: center;
      }
      .macros-col {
        width: 100%;
      }
      .empty-meals-card {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class NutritionTodayComponent {
  nutrition = inject(NutritionService);
}
