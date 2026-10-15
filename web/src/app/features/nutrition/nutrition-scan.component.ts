import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { NutritionService } from '../../core/services/nutrition.service';
import { GeminiService } from '../../core/services/gemini.service';

@Component({
  selector: 'app-nutrition-scan',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="scan-page">
      <!-- Back Header -->
      <header class="scan-header">
        <a routerLink="/nutrition" class="back-link">
          <app-icon name="chevron-left" [size]="20" />
          <span>Nutrition Scan</span>
        </a>
        <p class="scan-subtitle">Snap a photo of your meal and get instant insights.</p>
      </header>

      <div class="scan-layout">
        <!-- Viewfinder Card (From Reference Mockup) -->
        <div class="viewfinder-card card">
          <div class="camera-frame">
            <img [src]="previewImage()" alt="Meal scan preview" class="camera-img" />

            <!-- Laser Scanning Beam when analyzing -->
            @if (isAnalyzing()) {
              <div class="scan-laser"></div>
            }

            <!-- Viewfinder Corner Brackets Overlay -->
            <div class="viewfinder-bracket top-left"></div>
            <div class="viewfinder-bracket top-right"></div>
            <div class="viewfinder-bracket bottom-left"></div>
            <div class="viewfinder-bracket bottom-right"></div>

            <!-- Analyzing Status Overlay Bar (From Reference Mockup) -->
            <div class="analyzing-bar" [class.active-bar]="isAnalyzing()">
              <div class="spinner-group">
                <div class="ring-spinner" [class.spin-active]="isAnalyzing()"></div>
                <span class="analyzing-text">{{ isAnalyzing() ? 'Gemini 3.8 Flash analyzing meal...' : 'Meal analyzed successfully' }}</span>
              </div>
              <div class="steps-checklist">
                <div class="step-line" [class.done]="!isAnalyzing()">
                  <span class="check-icon">✓</span>
                  <span>Identifying food items</span>
                </div>
                <div class="step-line" [class.done]="!isAnalyzing()">
                  <span class="check-icon">✓</span>
                  <span>Estimating portion sizes</span>
                </div>
                <div class="step-line" [class.done]="!isAnalyzing()">
                  <span class="check-icon">✓</span>
                  <span>Calculating nutrition</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Upload / Camera Actions -->
          <div class="viewfinder-footer">
            <input type="file" accept="image/*" #fileInput (change)="onFileSelected($event)" style="display:none" />
            <button class="btn btn-primary snap-btn" (click)="fileInput.click()" [disabled]="isAnalyzing()">
              <app-icon name="camera" [size]="16" />
              <span>Snap / Upload Food Photo</span>
            </button>
            <button class="btn btn-secondary demo-btn" (click)="runDemoScan()" [disabled]="isAnalyzing()">
              Re-Scan Demo Bowl
            </button>
          </div>
        </div>

        <!-- Meal Review & Ingredient Adjustment Card (Part D4-5) -->
        <div class="review-card card">
          <div class="review-header">
            <div>
              <h3>{{ nutrition.activeDraftMeal().name }}</h3>
              <p class="verified-note">AI estimate · Numbers verified from food database</p>
            </div>
            <span class="badge badge-primary">High Confidence</span>
          </div>

          <!-- Total Macros Recalculated Dynamically via domain/macros.ts -->
          <div class="nutrition-summary-tile">
            <div class="total-cal">
              <span class="cal-num num">{{ draftTotals().kcal }}</span>
              <span class="cal-unit">kcal</span>
            </div>
            <div class="macros-pills">
              <div class="m-pill" style="border-color: var(--macro-protein);">
                <span class="m-tag">Protein</span>
                <span class="m-qty num">{{ draftTotals().protein }}g</span>
              </div>
              <div class="m-pill" style="border-color: var(--macro-carbs);">
                <span class="m-tag">Carbs</span>
                <span class="m-qty num">{{ draftTotals().carbs }}g</span>
              </div>
              <div class="m-pill" style="border-color: var(--macro-fat);">
                <span class="m-tag">Fats</span>
                <span class="m-qty num">{{ draftTotals().fat }}g</span>
              </div>
            </div>
          </div>

          <!-- Ingredients List with interactive gram steppers -->
          <div class="ingredients-section">
            <div class="ing-header">
              <span class="ing-title">Identified Ingredients</span>
              <span class="ing-tip">Adjust grams to recalculate</span>
            </div>

            <div class="ing-list">
              @for (item of nutrition.activeDraftMeal().ingredients; track item.id) {
                <div class="ing-row">
                  <div class="ing-info">
                    <span class="ing-name">{{ item.name }}</span>
                    <span class="ing-conf" [class.med]="item.confidence === 'Medium'">
                      {{ item.confidence }} confidence
                    </span>
                  </div>

                  <div class="ing-stepper">
                    <button class="step-btn" (click)="nutrition.updateIngredientGrams(item.id, -10)">-</button>
                    <span class="grams-val num">{{ item.grams }}g</span>
                    <button class="step-btn" (click)="nutrition.updateIngredientGrams(item.id, 10)">+</button>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Actions -->
          <div class="review-actions">
            <button class="btn btn-secondary" (click)="retakePhoto()">Retake</button>
            <button class="btn btn-primary add-log-btn" (click)="addToLog()">
              Add to Log
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scan-page {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .scan-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text);
      font-size: var(--fs-md);
      font-weight: 700;
      text-decoration: none;
    }
    .scan-subtitle {
      font-size: var(--fs-xs);
      color: var(--text-muted);
    }

    .scan-layout {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: var(--s-5);
    }

    /* Viewfinder */
    .viewfinder-card {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: #000;
    }
    .camera-frame {
      position: relative;
      height: 480px;
      overflow: hidden;
    }
    .camera-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.9);
    }

    /* Corner Bracket Guides (From Reference Screen) */
    .viewfinder-bracket {
      position: absolute;
      width: 32px;
      height: 32px;
      border: 3px solid rgba(255, 255, 255, 0.9);
      pointer-events: none;
    }
    .top-left {
      top: 36px;
      left: 36px;
      border-right: none;
      border-bottom: none;
      border-top-left-radius: 8px;
    }
    .top-right {
      top: 36px;
      right: 36px;
      border-left: none;
      border-bottom: none;
      border-top-right-radius: 8px;
    }
    .bottom-left {
      bottom: 120px;
      left: 36px;
      border-right: none;
      border-top: none;
      border-bottom-left-radius: 8px;
    }
    .bottom-right {
      bottom: 120px;
      right: 36px;
      border-left: none;
      border-top: none;
      border-bottom-right-radius: 8px;
    }

    /* Analyzing status bar (From Reference Screen) */
    .analyzing-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(11, 16, 21, 0.92);
      backdrop-filter: blur(8px);
      border-top: 1px solid var(--border);
      padding: var(--s-3) var(--s-4);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-3);
    }
    .spinner-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ring-spinner {
      width: 22px;
      height: 22px;
      border: 2.5px solid var(--primary-soft);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .analyzing-text {
      font-size: var(--fs-xs);
      font-weight: 600;
      color: var(--text);
    }
    .steps-checklist {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .step-line {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      color: var(--text-muted);
    }
    .check-icon {
      color: var(--primary);
      font-weight: 800;
    }

    /* Review Card */
    .review-card {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .review-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .review-header h3 {
      font-size: 1.25rem;
    }
    .verified-note {
      font-size: var(--fs-xs);
      color: var(--text-faint);
      margin-top: 2px;
    }

    .nutrition-summary-tile {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-card);
      padding: var(--s-3) var(--s-4);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-3);
    }
    .total-cal {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    .cal-num {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--text);
      line-height: 1;
    }
    .cal-unit {
      font-size: var(--fs-sm);
      color: var(--text-muted);
    }
    .macros-pills {
      display: flex;
      gap: 8px;
    }
    .m-pill {
      background: var(--surface);
      border: 1px solid;
      border-radius: var(--r-pill);
      padding: 6px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 62px;
    }
    .m-tag {
      font-size: 0.65rem;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .m-qty {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text);
    }

    /* Ingredients */
    .ingredients-section {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .ing-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }
    .ing-title {
      font-size: var(--fs-sm);
      font-weight: 700;
      color: var(--text);
    }
    .ing-tip {
      font-size: var(--fs-xs);
      color: var(--text-faint);
    }

    .ing-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ing-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-input);
      padding: 8px 12px;
    }
    .ing-info {
      display: flex;
      flex-direction: column;
    }
    .ing-name {
      font-size: var(--fs-xs);
      font-weight: 600;
      color: var(--text);
    }
    .ing-conf {
      font-size: 0.65rem;
      color: var(--primary);
    }
    .ing-conf.med {
      color: var(--accent-2);
    }

    .ing-stepper {
      display: flex;
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 2px 4px;
    }
    .step-btn {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      color: var(--text-muted);
      font-weight: 700;
    }
    .step-btn:hover {
      color: var(--text);
      background: var(--surface-2);
    }
    .grams-val {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text);
      min-width: 50px;
      text-align: center;
    }

    .review-actions {
      display: flex;
      gap: var(--s-3);
      margin-top: auto;
      padding-top: var(--s-3);
    }
    .add-log-btn {
      flex: 1;
    }

    .scan-laser {
      position: absolute;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--primary);
      box-shadow: 0 0 15px var(--primary), 0 0 30px var(--primary);
      z-index: 10;
      animation: laserSweep 2s ease-in-out infinite alternate;
    }
    @keyframes laserSweep {
      0% { top: 5%; opacity: 0.8; }
      100% { top: 92%; opacity: 1; }
    }

    .viewfinder-footer {
      display: flex;
      gap: var(--s-3);
      padding: var(--s-3) var(--s-4);
      background: var(--surface-2);
      border-top: 1px solid var(--border);
    }
    .snap-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .demo-btn {
      flex: 0 0 auto;
    }

    .active-bar {
      border-color: var(--primary-line);
      box-shadow: 0 0 16px -2px var(--primary-soft);
    }
    .spin-active {
      border-top-color: var(--primary) !important;
      animation: spin 0.8s linear infinite !important;
    }
    .step-line.done .check-icon {
      color: #22c55e;
    }

    @media (max-width: 860px) {
      .scan-layout {
        grid-template-columns: 1fr;
      }
      .camera-frame {
        height: 340px;
      }
      .viewfinder-footer {
        flex-direction: column;
      }
    }
  `]
})
export class NutritionScanComponent {
  nutrition = inject(NutritionService);
  gemini = inject(GeminiService);
  router = inject(Router);

  previewImage = signal<string>('/img/meal-bowl.jpg');
  isAnalyzing = signal<boolean>(false);

  draftTotals = computed(() => this.nutrition.computedDraftTotals());

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Data = reader.result as string;
      this.previewImage.set(base64Data);
      await this.processImage(base64Data, file.type || 'image/jpeg');
    };

    reader.readAsDataURL(file);
  }

  async runDemoScan() {
    this.previewImage.set('/img/meal-bowl.jpg');
    await this.processImage('/img/meal-bowl.jpg', 'image/jpeg');
  }

  private async processImage(base64OrPath: string, mimeType: string) {
    this.isAnalyzing.set(true);

    try {
      const result = await this.gemini.analyzeMealPhoto(base64OrPath, mimeType);

      const ingredients = result.ingredients.map((item, idx) => ({
        id: `ing-${idx}-${Date.now()}`,
        name: item.name,
        grams: item.grams,
        per100: item.per100,
        confidence: item.confidence
      }));

      this.nutrition.activeDraftMeal.set({
        name: result.dishName,
        image: this.previewImage(),
        ingredients,
        analyzing: false,
        analysisProgress: 100
      });
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  addToLog() {
    this.nutrition.saveDraftMeal();
    alert('Meal added to log! Daily macros and calories updated.');
    this.router.navigate(['/nutrition']);
  }

  retakePhoto() {
    this.runDemoScan();
  }
}

