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
            <span class="badge badge-primary">Target 2,400 kcal</span>
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
            <span class="badge badge-cyan">{{ nutrition.waterGlasses() }} of 8 Glasses</span>
          </div>

          <div class="glasses-row">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="glass-icon" [class.filled]="i <= nutrition.waterGlasses()">
                <app-icon name="water" [size]="24" />
              </div>
            }
          </div>

          <div class="water-actions">
            <button class="btn btn-secondary" (click)="nutrition.removeWaterGlass()">- 1 Glass</button>
            <button class="btn btn-primary" (click)="nutrition.addWaterGlass()">+ 1 Glass (250ml)</button>
          </div>
        </div>
      </div>

      <!-- Recent Meals Log -->
      <section class="meals-log-section">
        <h3>Logged Meals Today</h3>
        <div class="meals-list">
          <div class="meal-card card">
            <img src="/img/meal-bowl.jpg" alt="Chicken Bowl" class="meal-thumb" />
            <div class="meal-info">
              <div class="meal-name-row">
                <h4>Grilled Chicken & Quinoa Bowl</h4>
                <span class="meal-time">12:45 PM · AI Verified</span>
              </div>
              <div class="meal-nutrients num">
                <span class="nut-item"><strong>420</strong> kcal</span>
                <span class="nut-item">P: <strong>42g</strong></span>
                <span class="nut-item">C: <strong>45g</strong></span>
                <span class="nut-item">F: <strong>12g</strong></span>
              </div>
            </div>
            <span class="badge badge-primary">High Confidence</span>
          </div>
        </div>
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
    .meal-card {
      display: flex;
      align-items: center;
      gap: var(--s-4);
      padding: var(--s-3) var(--s-4);
    }
    .meal-thumb {
      width: 72px;
      height: 72px;
      border-radius: var(--r-input);
      object-fit: cover;
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
    }
    .nut-item strong {
      color: var(--text);
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
    }
  `]
})
export class NutritionTodayComponent {
  nutrition = inject(NutritionService);
}
