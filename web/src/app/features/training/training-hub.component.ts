import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { WorkoutService } from '../../core/services/workout.service';

@Component({
  selector: 'app-training-hub',
  standalone: true,
  imports: [RouterLink, IconComponent],
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
            <h2>Workout Library</h2>
            <span class="counter">200+ exercises</span>
          </div>

          <!-- Category Filter Pills (From Reference Mockup) -->
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

        <!-- Exercise Card Grid (From Reference Mockup) -->
        <div class="exercise-grid">
          @for (ex of filteredExercises(); track ex.id) {
            <div class="exercise-card card card-hover">
              <div class="card-media">
                <img [src]="ex.image" [alt]="ex.name" class="ex-img" />
                <button class="play-overlay-btn" title="View exercise">
                  <app-icon name="play" [size]="14" />
                </button>
              </div>
              <div class="card-content">
                <div class="card-title-row">
                  <h4 class="ex-name">{{ ex.name }}</h4>
                  <span class="ex-tag">{{ ex.muscle }}</span>
                </div>
                <div class="ex-meta">
                  <span>Last: {{ ex.lastPerformance }}</span>
                  <span class="meta-dot">·</span>
                  <span>PR: {{ ex.prKg }} kg</span>
                </div>
              </div>
            </div>
          }
        </div>
      </section>
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
  `]
})
export class TrainingHubComponent {
  workout = inject(WorkoutService);

  categories = ['All', 'Strength', 'HIIT', 'Mobility', 'Core', 'Full Body'];
  selectedCategory = signal('All');

  filteredExercises = computed(() => {
    const cat = this.selectedCategory();
    const list = this.workout.exerciseLibrary();
    if (cat === 'All') return list;
    return list.filter(e => e.category === cat);
  });
}
