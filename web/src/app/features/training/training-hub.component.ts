import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { WorkoutService, ExerciseItem } from '../../core/services/workout.service';
import { ExerciseModalComponent } from '../../shared/ui/exercise-modal/exercise-modal.component';

@Component({
  selector: 'app-training-hub',
  standalone: true,
  imports: [RouterLink, FormsModule, IconComponent, ExerciseModalComponent],
  template: `
    <div class="training-hub">
      <!-- Quick Start Session Banner -->
      <section class="session-banner card">
        <div class="banner-left">
          <span class="badge badge-primary">TODAY'S PLAN</span>
          <h2>Lower Body Strength</h2>
          <p>4 exercises · ~45 min · Barbell & Dumbbells</p>
        </div>
        <div class="banner-right">
          <a routerLink="/training/session/live" class="btn btn-primary start-btn">
            <app-icon name="play" [size]="16" />
            <span>Start Workout →</span>
          </a>
        </div>
      </section>

      <!-- Workout Library Header -->
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
                <img [src]="ex.image" [alt]="ex.name" class="ex-img" />
                
                @if (ex.videoUrl) {
                  <span class="motion-badge" title="3D Motion Guide Available">
                    <span class="motion-dot"></span>
                    <span>3D FORM</span>
                  </span>
                }

                <button class="play-overlay-btn" title="View video demonstration">
                  <app-icon name="play" [size]="14" />
                </button>
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

      <!-- Exercise Video & Form Modal -->
      @if (selectedExercise()) {
        <app-exercise-modal
          [exercise]="selectedExercise()"
          (closed)="selectedExercise.set(null)"
        />
      }
    </div>
  `,
  styles: [`
    .training-hub {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
    }

    .session-banner {
      background: linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-4);
      flex-wrap: wrap;
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
    .start-btn {
      padding: 12px 28px;
      font-size: var(--fs-md);
    }

    /* Library Section */
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

    /* Exercise Grid */
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
      color: var(--text);
    }

    .library-sub {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      margin-top: 2px;
    }
    .controls-row {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      margin-top: var(--s-3);
    }
    .search-field {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 10px 18px;
      transition: border-color var(--t-fast) var(--ease);
    }
    .search-field:focus-within {
      border-color: var(--primary);
    }
    .search-field input {
      background: none;
      border: none;
      outline: none;
      color: var(--text);
      font-size: var(--fs-sm);
      width: 100%;
    }
    .search-field input::placeholder {
      color: var(--text-muted);
    }
    .clear-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .clear-btn:hover {
      color: var(--text);
    }

    .motion-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(11, 16, 21, 0.85);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--r-pill);
      padding: 3px 8px;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: 0.05em;
    }
    .motion-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 6px var(--primary);
    }

    .empty-state {
      grid-column: 1 / -1;
      padding: var(--s-5);
      text-align: center;
      background: var(--surface-2);
      border: 1px dashed var(--border);
      border-radius: var(--r-card);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--s-3);
      color: var(--text-muted);
      font-size: var(--fs-sm);
    }
  `]
})
export class TrainingHubComponent {
  workout = inject(WorkoutService);

  categories = ['All', 'Strength', 'Hypertrophy', 'Mobility', 'Core', 'HIIT'];
  selectedCategory = signal('All');
  searchQuery = '';
  selectedExercise = signal<ExerciseItem | null>(null);

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

