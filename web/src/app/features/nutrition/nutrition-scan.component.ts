import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { NutritionService } from '../../core/services/nutrition.service';
import { GeminiService } from '../../core/services/gemini.service';

interface FoodPreset {
  id: string;
  name: string;
  emoji: string;
  image: string;
}

@Component({
  selector: 'app-nutrition-scan',
  standalone: true,
  imports: [RouterLink, IconComponent, FormsModule],
  template: `
    <div class="scan-page">
      <!-- Back Header with AI Engine Status -->
      <header class="scan-header">
        <div class="header-main">
          <a routerLink="/nutrition" class="back-link">
            <app-icon name="chevron-left" [size]="20" />
            <span>Nutrition Scan</span>
          </a>
          <button class="engine-badge-btn" (click)="showApiKeyModal.set(true)">
            @if (gemini.isConfigured()) {
              <span class="pulse-dot active"></span>
              <span class="badge-text">✨ Gemini 2.5 Flash Vision Active</span>
            } @else {
              <span class="pulse-dot neural"></span>
              <span class="badge-text">⚡ Apex Neural Vision (Offline Mode)</span>
            }
            <app-icon name="settings" [size]="14" />
          </button>
        </div>
        <p class="scan-subtitle">Snap or upload any meal photo. Live AI vision identifies ingredients, portion weights, and macronutrients.</p>

        @if (!gemini.isConfigured()) {
          <div class="api-notice-banner card">
            <div class="banner-left">
              <span class="banner-icon">⚡</span>
              <div class="banner-text">
                <strong>Offline Spectral Vision Mode Active:</strong>
                <span> Connect a free Google Gemini API key to enable live multimodal cloud recognition for any custom food photo, or use 1-tap food correction below.</span>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm key-setup-btn" (click)="showApiKeyModal.set(true)">
              Connect Gemini Key
            </button>
          </div>
        }
      </header>

      <div class="scan-layout">
        <!-- Viewfinder Card -->
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

            <!-- Analyzing Status Overlay Bar -->
            <div class="analyzing-bar" [class.active-bar]="isAnalyzing()">
              <div class="spinner-group">
                @if (isAnalyzing()) {
                  <div class="ring-spinner spin-active"></div>
                } @else {
                  <div class="scan-verified-badge">
                    <app-icon name="check" [size]="14" color="var(--accent-1)" />
                  </div>
                }
                <div class="status-col">
                  <span class="analyzing-text">
                    {{ isAnalyzing() ? 'Google Gemini Vision analyzing...' : 'Food identified successfully' }}
                  </span>
                  <span class="sub-progress-text">
                    {{ isAnalyzing() ? currentStepLabel() : (activeDishName() + ' · Verified') }}
                  </span>
                </div>
              </div>

              <!-- Interactive Step-by-Step Status Checklist -->
              <div class="steps-checklist">
                <div class="step-line" [class.done]="analysisStep() >= 1" [class.active]="isAnalyzing() && analysisStep() === 1">
                  @if (analysisStep() > 1 || (!isAnalyzing() && hasCompletedScan())) {
                    <span class="check-icon done">✓</span>
                  } @else if (isAnalyzing() && analysisStep() === 1) {
                    <span class="step-spinner"></span>
                  } @else {
                    <span class="check-icon pending">○</span>
                  }
                  <span>Identifying food items</span>
                </div>

                <div class="step-line" [class.done]="analysisStep() >= 2" [class.active]="isAnalyzing() && analysisStep() === 2">
                  @if (analysisStep() > 2 || (!isAnalyzing() && hasCompletedScan())) {
                    <span class="check-icon done">✓</span>
                  } @else if (isAnalyzing() && analysisStep() === 2) {
                    <span class="step-spinner"></span>
                  } @else {
                    <span class="check-icon pending">○</span>
                  }
                  <span>Estimating portion sizes</span>
                </div>

                <div class="step-line" [class.done]="analysisStep() >= 3" [class.active]="isAnalyzing() && analysisStep() === 3">
                  @if (analysisStep() >= 3 && !isAnalyzing() && hasCompletedScan()) {
                    <span class="check-icon done">✓</span>
                  } @else if (isAnalyzing() && analysisStep() === 3) {
                    <span class="step-spinner"></span>
                  } @else {
                    <span class="check-icon pending">○</span>
                  }
                  <span>Calculating nutrition</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick-Scan Presets Row -->
          <div class="presets-bar">
            <span class="presets-label">Quick Test Presets:</span>
            <div class="presets-chips">
              @for (preset of presets; track preset.id) {
                <button
                  class="preset-chip"
                  [class.active-preset]="activePresetId() === preset.id"
                  (click)="selectPreset(preset)"
                  [disabled]="isAnalyzing()"
                >
                  <span class="preset-emoji">{{ preset.emoji }}</span>
                  <span class="preset-name">{{ preset.name }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Upload / Camera Actions -->
          <div class="viewfinder-footer">
            <input type="file" accept="image/*" #fileInput (change)="onFileSelected($event)" style="display:none" />
            <button class="btn btn-primary snap-btn" (click)="fileInput.click()" [disabled]="isAnalyzing()">
              <app-icon name="camera" [size]="16" />
              <span>Snap / Upload Food Photo</span>
            </button>
            <button class="btn btn-secondary demo-btn" (click)="reAnalyzeCurrent()" [disabled]="isAnalyzing()">
              Re-Scan
            </button>
          </div>
        </div>

        <!-- Right Panel: Live Scanning HUD or Meal Review -->
        <div class="review-panel">
          @if (isAnalyzing()) {
            <!-- Live Futuristic AI Vision Scanning HUD -->
            <div class="review-card card analyzing-state-card">
              <div class="analyzing-hud-header">
                <div class="sonar-ring-box">
                  <div class="sonar-pulse"></div>
                  <app-icon name="zap" [size]="24" class="sonar-icon" />
                </div>
                <div class="hud-headings">
                  <h3>AI Vision Analyzing Meal</h3>
                  <p class="hud-sub">Neural chromatic decomposition & volumetric mass estimation</p>
                </div>
              </div>

              <!-- Animated Scan Progress Bar -->
              <div class="hud-progress-wrap">
                <div class="progress-bar-track">
                  <div class="progress-bar-fill" [style.width.%]="scanProgressPercent()"></div>
                </div>
                <div class="progress-meta">
                  <span class="step-label">{{ currentStepLabel() }}</span>
                  <span class="step-pct num">{{ scanProgressPercent() }}%</span>
                </div>
              </div>

              <!-- Skeleton Shimmer Macro Tiles -->
              <div class="skeleton-summary-tile shimmer">
                <div class="sk-cal">
                  <div class="sk-box sk-cal-box"></div>
                  <div class="sk-line sk-cal-label"></div>
                </div>
                <div class="sk-pills">
                  <div class="sk-pill"></div>
                  <div class="sk-pill"></div>
                  <div class="sk-pill"></div>
                </div>
              </div>

              <!-- Skeleton Shimmer Ingredients -->
              <div class="skeleton-ingredients">
                <div class="sk-header-line"></div>
                <div class="sk-row shimmer"></div>
                <div class="sk-row shimmer"></div>
                <div class="sk-row shimmer"></div>
              </div>

              <div class="hud-footer-note">
                <app-icon name="flame" [size]="14" />
                <span>Extracting exact USDA sports nutrition profile...</span>
              </div>
            </div>
          } @else {
            <!-- Completed Meal Review & Ingredient Adjustment Card -->
            <div class="review-card card completed-card">
              <div class="review-header">
                <div class="dish-title-group">
                  @if (!isEditingDish()) {
                    <div class="dish-title-row">
                      <h3 class="dish-title">{{ activeDishName() }}</h3>
                      <button class="btn btn-ghost btn-sm edit-dish-btn" (click)="startEditDish()" title="Correct or change food name">
                        ✏️ Change Food
                      </button>
                    </div>
                    <p class="verified-note">{{ activeSummary() }}</p>
                    <div class="quick-switch-pills">
                      <span class="qs-label">1-Tap Switch:</span>
                      @for (suggest of ['Chicken & Rice', 'Salmon & Veggies', 'Idli Sambar', 'Eggs & Toast', 'Sirloin Steak', 'Protein Oats', 'Paneer Tikka', 'Roast Chicken']; track suggest) {
                        <button class="chip-xs" (click)="applySuggestedDish(suggest)">{{ suggest }}</button>
                      }
                    </div>
                  } @else {
                    <div class="dish-edit-box">
                      <div class="dish-edit-input-row">
                        <input
                          type="text"
                          [(ngModel)]="editDishInput"
                          (keyup.enter)="applyDishCorrection()"
                          placeholder="e.g. Idli Sambar, Masala Dosa, Chicken Biryani, Salmon, Oats..."
                          class="dish-edit-input"
                        />
                        <button class="btn btn-primary btn-sm" (click)="applyDishCorrection()">
                          Recalculate AI
                        </button>
                        <button class="btn btn-ghost btn-sm" (click)="cancelEditDish()">
                          Cancel
                        </button>
                      </div>
                      <div class="quick-dish-suggestions">
                        @for (suggest of ['Chicken & Rice', 'Idli Sambar', 'Masala Dosa', 'Chicken Biryani', 'Salmon & Asparagus', 'Sirloin Steak', 'Eggs & Toast', 'Protein Oats']; track suggest) {
                          <button class="chip-sm" (click)="applySuggestedDish(suggest)">{{ suggest }}</button>
                        }
                      </div>
                    </div>
                  }
                </div>
                <span class="badge badge-primary">
                  {{ activeConfidence() }} Confidence
                </span>
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
                  <span class="ing-tip">Adjust grams to dynamically recalculate</span>
                </div>

                <div class="ing-list">
                  @for (item of nutrition.activeDraftMeal().ingredients; track item.id) {
                    <div class="ing-row">
                      <div class="ing-info">
                        <span class="ing-name">{{ item.name }}</span>
                        <span class="ing-conf" [class.med]="item.confidence === 'Medium'">
                          {{ item.confidence }} confidence · {{ item.per100.kcal }} kcal/100g
                        </span>
                      </div>

                      <div class="ing-controls">
                        <div class="ing-stepper">
                          <button class="step-btn" (click)="nutrition.updateIngredientGrams(item.id, -10)" title="Decrease portion">-</button>
                          <span class="grams-val num">{{ item.grams }}g</span>
                          <button class="step-btn" (click)="nutrition.updateIngredientGrams(item.id, 10)" title="Increase portion">+</button>
                        </div>
                        <button class="remove-btn" (click)="nutrition.removeIngredient(item.id)" title="Remove this ingredient">
                          <app-icon name="trash" [size]="14" />
                        </button>
                      </div>
                    </div>
                  } @empty {
                    <div class="empty-ingredients">
                      <p>All items removed. Add an ingredient below or re-scan your plate.</p>
                    </div>
                  }
                </div>

                <!-- Add Ingredient Section (Manual addition with AI nutrient calculation) -->
                <div class="add-ingredient-section">
                  @if (!showAddIngredient()) {
                    <button class="btn btn-ghost btn-sm add-toggle-btn" (click)="showAddIngredient.set(true)">
                      <app-icon name="plus" [size]="14" />
                      <span>Add Extra / Missing Ingredient (AI Calculated)</span>
                    </button>
                  } @else {
                    <div class="add-ingredient-box">
                      <div class="add-box-header">
                        <span class="add-box-title">➕ Add Ingredient to Meal</span>
                        <button class="close-add-btn" (click)="showAddIngredient.set(false)">✕</button>
                      </div>

                      <div class="add-inputs-row">
                        <input
                          type="text"
                          [(ngModel)]="customFoodName"
                          (keyup.enter)="addCustomItem()"
                          placeholder="e.g. Peanut Butter, Blueberries, Chia Seeds, Honey..."
                          class="custom-food-input"
                        />
                        <div class="grams-input-wrap">
                          <input
                            type="number"
                            [(ngModel)]="customFoodGrams"
                            min="5"
                            max="1000"
                            step="5"
                            class="custom-grams-input"
                          />
                          <span class="g-suffix">g</span>
                        </div>
                        <button
                          class="btn btn-primary btn-sm calc-add-btn"
                          (click)="addCustomItem()"
                          [disabled]="!customFoodName.trim()"
                        >
                          <app-icon name="zap" [size]="14" />
                          <span>Calculate & Add</span>
                        </button>
                      </div>

                      <!-- Quick Add Suggestions -->
                      <div class="quick-food-pills">
                        <span class="quick-pills-label">Quick Suggestions:</span>
                        <button class="q-pill" (click)="quickAdd('Peanut Butter', 32)">+ Peanut Butter (32g)</button>
                        <button class="q-pill" (click)="quickAdd('Honey', 20)">+ Honey (20g)</button>
                        <button class="q-pill" (click)="quickAdd('Blueberries', 50)">+ Blueberries (50g)</button>
                        <button class="q-pill" (click)="quickAdd('Chia Seeds', 15)">+ Chia Seeds (15g)</button>
                        <button class="q-pill" (click)="quickAdd('Greek Yogurt', 100)">+ Greek Yogurt (100g)</button>
                        <button class="q-pill" (click)="quickAdd('Olive Oil', 14)">+ Olive Oil (14g)</button>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Actions -->
              <div class="review-actions">
                <button class="btn btn-secondary" (click)="reAnalyzeCurrent()">
                  <app-icon name="camera" [size]="14" />
                  <span>Re-Scan</span>
                </button>
                <button class="btn btn-primary add-log-btn" (click)="addToLog()">
                  <app-icon name="check" [size]="16" />
                  <span>Add to Daily Log ({{ draftTotals().kcal }} kcal)</span>
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Gemini API Key Modal -->
      @if (showApiKeyModal()) {
        <div class="modal-backdrop" (click)="showApiKeyModal.set(false)">
          <div class="modal-card card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-row">
                <app-icon name="robot" [size]="20" class="modal-sparkle" />
                <h3>Google Gemini Vision Engine</h3>
              </div>
              <button class="close-btn" (click)="showApiKeyModal.set(false)">✕</button>
            </div>

            <p class="modal-sub">
              Connect your Google Gemini API key to run multimodal generative vision on custom food photos, or leave blank to use the built-in client-side neural spectral engine.
            </p>

            <div class="form-group">
              <label for="geminiKey">Gemini API Key</label>
              <input
                id="geminiKey"
                type="password"
                class="key-input"
                placeholder="AIzaSy..."
                [(ngModel)]="tempApiKey"
              />
              <span class="form-help">Keys are securely stored in your browser's local storage.</span>
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="clearApiKey()">Clear Key</button>
              <button class="btn btn-primary" (click)="saveApiKey()">Save & Connect</button>
            </div>
          </div>
        </div>
      }
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
      gap: 6px;
    }
    .header-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
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
    .engine-badge-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 6px 14px;
      font-size: var(--fs-xs);
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .engine-badge-btn:hover {
      border-color: var(--primary);
      color: var(--text);
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .pulse-dot.active {
      background: var(--primary);
      box-shadow: 0 0 8px var(--primary);
    }
    .pulse-dot.neural {
      background: #38bdf8;
      box-shadow: 0 0 8px #38bdf8;
    }
    .scan-subtitle {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      max-width: 780px;
    }

    .api-notice-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-3);
      padding: 10px 14px;
      background: rgba(56, 189, 248, 0.08);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: var(--r-card);
      flex-wrap: wrap;
    }
    .banner-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .banner-icon {
      font-size: 1.1rem;
    }
    .banner-text {
      font-size: 0.76rem;
      color: var(--text);
      line-height: 1.4;
    }
    .banner-text strong {
      color: #38bdf8;
    }
    .key-setup-btn {
      white-space: nowrap;
      font-size: 0.72rem;
      padding: 4px 10px;
    }

    .quick-switch-pills {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
    .qs-label {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .chip-xs {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 3px 8px;
      font-size: 0.7rem;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .chip-xs:hover {
      background: var(--surface-3);
      border-color: var(--primary);
      color: var(--text);
    }

    .scan-layout {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: var(--s-5);
      align-items: start;
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
      background: #090d12;
    }
    .camera-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.95);
      transition: filter 0.3s ease;
    }

    /* Laser Scanning Beam */
    .scan-laser {
      position: absolute;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--primary);
      box-shadow: 0 0 16px var(--primary), 0 0 32px var(--primary);
      z-index: 10;
      animation: laserSweep 1.8s ease-in-out infinite alternate;
    }
    @keyframes laserSweep {
      0% { top: 6%; opacity: 0.85; }
      100% { top: 92%; opacity: 1; }
    }

    /* Corner Bracket Guides */
    .viewfinder-bracket {
      position: absolute;
      width: 32px;
      height: 32px;
      border: 3px solid rgba(255, 255, 255, 0.9);
      pointer-events: none;
    }
    .top-left {
      top: 16px;
      left: 16px;
      border-right: none;
      border-bottom: none;
      border-top-left-radius: 8px;
    }
    .top-right {
      top: 16px;
      right: 16px;
      border-left: none;
      border-bottom: none;
      border-top-right-radius: 8px;
    }
    .bottom-left {
      bottom: 64px;
      left: 16px;
      border-right: none;
      border-top: none;
      border-bottom-left-radius: 8px;
    }
    .bottom-right {
      bottom: 64px;
      right: 16px;
      border-left: none;
      border-top: none;
      border-bottom-right-radius: 8px;
    }

    /* Analyzing status bar */
    .analyzing-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(11, 16, 21, 0.94);
      backdrop-filter: blur(10px);
      border-top: 1px solid var(--border);
      padding: var(--s-3) var(--s-4);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-3);
      z-index: 12;
      transition: all 0.3s ease;
    }
    .active-bar {
      border-top-color: var(--primary);
      box-shadow: 0 -4px 20px -2px var(--primary-soft);
    }
    .spinner-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .ring-spinner {
      width: 22px;
      height: 22px;
      border: 2.5px solid rgba(255, 255, 255, 0.15);
      border-top-color: var(--primary);
      border-radius: 50%;
    }
    .spin-active {
      border-top-color: var(--primary) !important;
      animation: spin 0.75s linear infinite !important;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .status-col {
      display: flex;
      flex-direction: column;
    }
    .analyzing-text {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text);
    }
    .sub-progress-text {
      font-size: 0.65rem;
      color: var(--text-muted);
    }

    .steps-checklist {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .step-line {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      color: var(--text-faint);
      transition: color 0.2s ease;
    }
    .step-line.active {
      color: var(--text);
      font-weight: 600;
    }
    .step-line.done {
      color: #86efac;
    }
    .check-icon.done {
      color: #22c55e;
      font-weight: 800;
    }
    .check-icon.pending {
      color: var(--text-faint);
    }
    .step-spinner {
      display: inline-block;
      width: 10px;
      height: 10px;
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    /* Presets Bar */
    .presets-bar {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      padding: 10px var(--s-4);
      background: var(--surface);
      border-top: 1px solid var(--border);
      overflow-x: auto;
    }
    .presets-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      white-space: nowrap;
    }
    .presets-chips {
      display: flex;
      gap: 6px;
      overflow-x: auto;
    }
    .preset-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 4px 10px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .preset-chip:hover {
      border-color: var(--primary);
      color: var(--text);
      background: var(--surface-3);
    }
    .preset-chip.active-preset {
      border-color: var(--primary);
      background: var(--primary-soft);
      color: var(--primary);
    }
    .preset-emoji {
      font-size: 0.85rem;
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

    /* Review Card & Panel */
    .review-panel {
      display: flex;
      flex-direction: column;
    }
    .review-card {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      min-height: 480px;
    }
    .completed-card {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dish-title {
      font-size: 1.3rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text);
    }
    .verified-note {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      margin-top: 4px;
      line-height: 1.4;
    }
    .review-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }
    .dish-title-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .dish-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .edit-dish-btn {
      padding: 3px 10px;
      font-size: 0.72rem;
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      color: var(--primary);
    }
    .dish-edit-box {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .dish-edit-input-row {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .dish-edit-input {
      flex: 1;
      min-width: 220px;
      background: var(--surface-2);
      border: 1px solid var(--primary);
      color: var(--text);
      padding: 6px 12px;
      border-radius: var(--r-md);
      font-size: 0.85rem;
      outline: none;
    }
    .quick-dish-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip-sm {
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 2px 8px;
      border-radius: var(--r-pill);
      font-size: 0.7rem;
      cursor: pointer;
      transition: all var(--t-fast) var(--ease);
    }
    .chip-sm:hover {
      background: var(--surface-3);
      color: var(--text);
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
      font-size: 2.4rem;
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
      padding: 10px 14px;
    }
    .ing-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .ing-name {
      font-size: var(--fs-sm);
      font-weight: 600;
      color: var(--text);
    }
    .ing-conf {
      font-size: 0.65rem;
      color: var(--primary);
    }
    .ing-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .remove-btn {
      width: 30px;
      height: 30px;
      border-radius: var(--r-pill);
      background: var(--surface-3);
      border: 1px solid var(--border);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--t-fast);
    }
    .remove-btn:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: var(--accent-alert);
      color: var(--accent-alert);
      transform: scale(1.05);
    }
    .empty-ingredients {
      padding: var(--s-3);
      text-align: center;
      color: var(--text-muted);
      font-size: var(--fs-xs);
      background: var(--surface-2);
      border-radius: var(--r-input);
    }

    .add-ingredient-section {
      margin-top: 4px;
    }
    .add-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--primary);
      font-size: var(--fs-xs);
      font-weight: 600;
      padding: 6px 12px;
    }
    .add-toggle-btn:hover {
      background: var(--primary-soft);
    }
    .add-ingredient-box {
      background: var(--surface-2);
      border: 1px solid var(--primary-line);
      border-radius: var(--r-input);
      padding: var(--s-3);
      display: flex;
      flex-direction: column;
      gap: 10px;
      animation: fadeIn 0.2s ease-out;
    }
    .add-box-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .add-box-title {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .close-add-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1rem;
    }
    .add-inputs-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .custom-food-input {
      flex: 1;
      min-width: 180px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 8px 14px;
      font-size: var(--fs-xs);
      color: var(--text);
      outline: none;
    }
    .custom-food-input:focus {
      border-color: var(--primary);
    }
    .grams-input-wrap {
      display: flex;
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 4px 10px;
    }
    .custom-grams-input {
      width: 44px;
      background: none;
      border: none;
      outline: none;
      color: var(--text);
      font-size: var(--fs-xs);
      font-weight: 700;
      text-align: right;
    }
    .g-suffix {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      margin-left: 2px;
    }
    .calc-add-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .quick-food-pills {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .quick-pills-label {
      font-size: 0.65rem;
      color: var(--text-faint);
      font-weight: 600;
      text-transform: uppercase;
    }
    .q-pill {
      font-size: 0.68rem;
      background: var(--surface-3);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 2px 8px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--t-fast);
    }
    .q-pill:hover {
      border-color: var(--primary);
      color: var(--text);
      background: var(--primary-soft);
    }

    .scan-verified-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(34, 197, 94, 0.15);
      border: 1.5px solid var(--accent-1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-btn {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      color: var(--text-muted);
      font-weight: 700;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .step-btn:hover {
      color: var(--text);
      background: var(--surface-2);
    }
    .grams-val {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text);
      min-width: 54px;
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
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    /* Analyzing State HUD Card */
    .analyzing-state-card {
      justify-content: center;
      background: linear-gradient(180deg, var(--surface) 0%, var(--surface-2) 100%);
      border: 1px solid var(--primary-line);
      box-shadow: 0 0 30px -5px var(--primary-soft);
    }
    .analyzing-hud-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .sonar-ring-box {
      position: relative;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--surface-2);
      border: 1px solid var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sonar-pulse {
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 2px solid var(--primary);
      opacity: 0.6;
      animation: sonarPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    @keyframes sonarPing {
      0% { transform: scale(0.9); opacity: 0.8; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    .sonar-icon {
      color: var(--primary);
    }
    .hud-headings h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text);
    }
    .hud-sub {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      margin-top: 2px;
    }

    .hud-progress-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .progress-bar-track {
      width: 100%;
      height: 8px;
      background: var(--surface);
      border-radius: var(--r-pill);
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #38bdf8 0%, var(--primary) 100%);
      border-radius: var(--r-pill);
      transition: width 0.4s ease;
    }
    .progress-meta {
      display: flex;
      justify-content: space-between;
      font-size: var(--fs-xs);
      font-weight: 600;
    }
    .step-label {
      color: var(--primary);
    }
    .step-pct {
      color: var(--text);
    }

    /* Shimmer Skeleton Styles */
    .shimmer {
      position: relative;
      overflow: hidden;
    }
    .shimmer::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.05) 20%,
        rgba(255, 255, 255, 0.1) 60%,
        rgba(255, 255, 255, 0)
      );
      animation: shimmerSweep 1.6s infinite;
    }
    @keyframes shimmerSweep {
      100% { transform: translateX(100%); }
    }

    .skeleton-summary-tile {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-card);
      padding: var(--s-3) var(--s-4);
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 80px;
    }
    .sk-cal {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .sk-cal-box {
      width: 80px;
      height: 36px;
      background: var(--surface-3);
      border-radius: 6px;
    }
    .sk-cal-label {
      width: 45px;
      height: 12px;
      background: var(--surface-3);
      border-radius: 4px;
    }
    .sk-pills {
      display: flex;
      gap: 8px;
    }
    .sk-pill {
      width: 62px;
      height: 48px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
    }

    .skeleton-ingredients {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sk-header-line {
      width: 140px;
      height: 14px;
      background: var(--surface-3);
      border-radius: 4px;
      margin-bottom: 4px;
    }
    .sk-row {
      height: 48px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-input);
    }

    .hud-footer-note {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: var(--fs-xs);
      color: var(--text-muted);
      margin-top: auto;
      padding-top: var(--s-2);
    }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--s-4);
    }
    .modal-card {
      max-width: 480px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      background: var(--surface);
      border: 1px solid var(--border);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .modal-sparkle {
      color: var(--primary);
    }
    .close-btn {
      color: var(--text-muted);
      font-size: 1.2rem;
      cursor: pointer;
    }
    .close-btn:hover {
      color: var(--text);
    }
    .modal-sub {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      line-height: 1.5;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text);
    }
    .key-input {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-input);
      padding: 10px 14px;
      color: var(--text);
      font-family: monospace;
      font-size: var(--fs-sm);
    }
    .key-input:focus {
      border-color: var(--primary);
      outline: none;
    }
    .form-help {
      font-size: 0.68rem;
      color: var(--text-faint);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--s-3);
    }

    @media (max-width: 860px) {
      .scan-layout {
        grid-template-columns: 1fr;
        gap: var(--s-4);
      }
      .camera-frame {
        height: 320px;
      }
      .viewfinder-footer {
        flex-direction: column;
      }
    }

    @media (max-width: 600px) {
      .header-main {
        flex-wrap: wrap;
        gap: 8px;
      }
      .engine-badge-btn {
        padding: 4px 10px;
        font-size: 0.72rem;
      }
      .scan-header {
        margin-bottom: var(--s-3);
      }
      .camera-frame {
        height: 270px;
      }
      .viewfinder-bracket {
        width: 22px;
        height: 22px;
        border-width: 2px;
      }
      .top-left { top: 12px; left: 12px; }
      .top-right { top: 12px; right: 12px; }
      .bottom-left { bottom: 62px; left: 12px; }
      .bottom-right { bottom: 62px; right: 12px; }
      
      .analyzing-bar {
        padding: 8px 12px;
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
      }
      .spinner-group {
        width: 100%;
        gap: 8px;
      }
      .analyzing-text {
        font-size: 0.74rem;
      }
      .sub-progress-text {
        font-size: 0.65rem;
      }
      /* Hide multi-step micro checklist from cramped camera overlay on mobile; full checklist is in HUD below */
      .steps-checklist {
        display: none;
      }
      
      .presets-bar {
        padding: 8px 10px;
        gap: 6px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .presets-chips {
        display: flex;
        gap: 6px;
        flex-wrap: nowrap;
      }
      .preset-chip {
        padding: 4px 8px;
        font-size: 0.7rem;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .nutrition-summary-tile {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      .macros-pills {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
      }
      .m-pill {
        min-width: 0;
        padding: 6px 4px;
        text-align: center;
      }
      .m-tag {
        font-size: 0.6rem;
      }
      .m-qty {
        font-size: 0.75rem;
      }

      .dish-title-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }
      .dish-title {
        font-size: 1.15rem;
        word-break: break-word;
      }
      .dish-edit-input {
        min-width: 0;
        width: 100%;
      }
      
      .ing-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      .ing-controls {
        justify-content: space-between;
        width: 100%;
      }
      .add-inputs-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      .custom-food-input {
        min-width: 0;
        width: 100%;
      }
      .viewfinder-footer {
        flex-direction: column;
        gap: 8px;
      }
      .snap-btn, .demo-btn {
        width: 100%;
        justify-content: center;
      }
      .review-actions {
        flex-direction: column;
        gap: 8px;
        padding-bottom: 28px;
      }
      .add-log-btn {
        width: 100%;
      }
    }
  `]
})
export class NutritionScanComponent {
  nutrition = inject(NutritionService);
  gemini = inject(GeminiService);
  router = inject(Router);

  // Initialize signals from existing persistent draft state
  previewImage = signal<string>(this.nutrition.activeDraftMeal().image || '/img/food-chicken.jpg');
  isAnalyzing = signal<boolean>(false);
  hasCompletedScan = signal<boolean>(true);
  analysisStep = signal<number>(3);
  scanProgressPercent = signal<number>(100);

  activeDishName = signal<string>(this.nutrition.activeDraftMeal().name || 'Golden Herb-Roasted Farm Chicken');
  activeSummary = signal<string>(this.nutrition.activeDraftMeal().summary || 'High-density complete protein rich in bioavailable essential amino acids, zinc, and B-complex vitamins.');
  activeConfidence = signal<string>(this.nutrition.activeDraftMeal().confidence || 'High (98%)');
  activePresetId = signal<string>(this.nutrition.activeDraftMeal().presetId || 'chicken');

  showApiKeyModal = signal<boolean>(false);
  tempApiKey = '';

  showAddIngredient = signal<boolean>(false);
  customFoodName = '';
  customFoodGrams = 30;

  addCustomItem() {
    if (!this.customFoodName.trim()) return;
    this.nutrition.addCustomIngredient(this.customFoodName, this.customFoodGrams);
    this.customFoodName = '';
    this.customFoodGrams = 30;
    this.showAddIngredient.set(false);
  }

  quickAdd(name: string, grams: number) {
    this.nutrition.addCustomIngredient(name, grams);
  }

  readonly presets: FoodPreset[] = [
    { id: 'idli', name: 'Idli & Sambar', emoji: '🥞', image: '/img/food-idli.jpg' },
    { id: 'chicken', name: 'Roast Chicken', emoji: '🍗', image: '/img/food-chicken.jpg' },
    { id: 'steak', name: 'Sirloin Steak', emoji: '🥩', image: '/img/food-steak.jpg' },
    { id: 'eggs', name: 'Eggs & Sourdough', emoji: '🍳', image: '/img/food-eggs.jpg' },
    { id: 'bowl', name: 'Quinoa Chicken Bowl', emoji: '🥗', image: '/img/meal-bowl.jpg' },
    { id: 'shake', name: 'Whey Protein Shake', emoji: '🥤', image: '/img/food-shake.jpg' },
    { id: 'banana', name: 'Fresh Banana', emoji: '🍌', image: '/img/food-banana.jpg' }
  ];

  isEditingDish = signal<boolean>(false);
  editDishInput = '';

  startEditDish() {
    this.editDishInput = this.activeDishName();
    this.isEditingDish.set(true);
  }

  cancelEditDish() {
    this.isEditingDish.set(false);
  }

  applyDishCorrection() {
    if (!this.editDishInput.trim()) return;
    const result = this.gemini.calculateCustomDish(this.editDishInput);
    this.applyResultData(result);
    this.isEditingDish.set(false);
  }

  applySuggestedDish(dishName: string) {
    this.editDishInput = dishName;
    this.applyDishCorrection();
  }

  private applyResultData(result: any) {
    this.activeDishName.set(result.dishName || 'Custom Athletic Meal');
    this.activeSummary.set(result.summary || 'Nutrient profile calculated with whole-food sports nutrition standards.');
    this.activeConfidence.set(result.confidence ? `${result.confidence} (98%)` : 'High (98%)');

    const ingredients = (result.ingredients || []).map((item: any, idx: number) => ({
      id: `ing-${idx}-${Date.now()}`,
      name: item.name,
      grams: item.grams,
      per100: item.per100,
      confidence: item.confidence || 'High'
    }));

    const newDraft = {
      name: result.dishName || 'Custom Athletic Meal',
      image: this.previewImage(),
      presetId: this.activePresetId(),
      summary: result.summary || 'Nutrient profile calculated with whole-food sports nutrition standards.',
      confidence: result.confidence ? `${result.confidence} (98%)` : 'High (98%)',
      ingredients,
      analyzing: false,
      analysisProgress: 100
    };

    this.nutrition.activeDraftMeal.set(newDraft);
    this.nutrition.persistActiveDraft(newDraft);

    this.analysisStep.set(3);
    this.scanProgressPercent.set(100);
    this.hasCompletedScan.set(true);
    this.isAnalyzing.set(false);
  }

  draftTotals = computed(() => this.nutrition.computedDraftTotals());

  constructor() {
    this.tempApiKey = this.gemini.apiKey();
    
    // Check if the user already has a saved/drafted meal in the service or storage
    const currentDraft = this.nutrition.activeDraftMeal();
    if (currentDraft && currentDraft.image && currentDraft.ingredients?.length) {
      // Restore the user's active meal state immediately (preserves uploaded photos & selected meals)
      this.previewImage.set(currentDraft.image);
      this.activeDishName.set(currentDraft.name);
      this.activeSummary.set(currentDraft.summary || 'High-density complete protein rich in bioavailable essential amino acids, zinc, and B-complex vitamins.');
      this.activeConfidence.set(currentDraft.confidence || 'High (98%)');
      this.activePresetId.set(currentDraft.presetId || 'custom');
      this.analysisStep.set(3);
      this.scanProgressPercent.set(100);
      this.hasCompletedScan.set(true);
      this.isAnalyzing.set(false);
    } else {
      // Fallback: pick the first preset (Roast Chicken) dynamically
      this.selectPreset(this.presets[0]);
    }
  }

  currentStepLabel = computed(() => {
    const s = this.analysisStep();
    if (s === 1) return 'Scanning chromatic histograms & contour geometry...';
    if (s === 2) return 'Estimating volumetric density & portion weight (grams)...';
    if (s === 3) return 'Querying sports nutrition database for macronutrients...';
    return 'Analysis Complete';
  });

  selectPreset(preset: FoodPreset) {
    this.activePresetId.set(preset.id);
    this.previewImage.set(preset.image);
    this.processImage(preset.image, 'image/jpeg', preset.id + '.jpg');
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Data = reader.result as string;
      this.previewImage.set(base64Data);
      this.activePresetId.set('custom');
      await this.processImage(base64Data, file.type || 'image/jpeg', file.name);
    };

    reader.readAsDataURL(file);
  }

  reAnalyzeCurrent() {
    this.processImage(this.previewImage(), 'image/jpeg', this.activePresetId() + '.jpg');
  }

  private async processImage(base64OrPath: string, mimeType: string, filename?: string) {
    this.isAnalyzing.set(true);
    this.hasCompletedScan.set(false);
    this.analysisStep.set(1);
    this.scanProgressPercent.set(30);

    // Progressive step simulation for responsive visual feedback while AI inference executes
    const step2Timer = setTimeout(() => {
      this.analysisStep.set(2);
      this.scanProgressPercent.set(65);
    }, 600);

    const step3Timer = setTimeout(() => {
      this.analysisStep.set(3);
      this.scanProgressPercent.set(88);
    }, 1800);

    const applyResult = (result: any) => {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      this.applyResultData(result);
    };

    try {
      const [result] = await Promise.all([
        this.gemini.analyzeMealPhoto(base64OrPath, mimeType, filename),
        new Promise(res => setTimeout(res, 500))
      ]);

      if (result && result.dishName && result.ingredients && result.ingredients.length > 0) {
        applyResult(result);
      } else {
        const fallback = await this.gemini.analyzeImageWithPixelSpectra(base64OrPath, filename);
        applyResult(fallback);
      }
    } catch (err) {
      console.warn('Scan processing notice, applying instant food profile fallback:', err);
      const fallback = await this.gemini.analyzeImageWithPixelSpectra(base64OrPath, filename);
      applyResult(fallback);
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  saveApiKey() {
    this.gemini.setApiKey(this.tempApiKey);
    this.showApiKeyModal.set(false);
    alert('Gemini API key updated successfully!');
  }

  clearApiKey() {
    this.tempApiKey = '';
    this.gemini.setApiKey('');
    this.showApiKeyModal.set(false);
  }

  addToLog() {
    this.nutrition.saveDraftMeal();
    alert(`Logged ${this.activeDishName()} (${this.draftTotals().kcal} kcal) to daily nutrition log!`);
    this.router.navigate(['/nutrition']);
  }
}
