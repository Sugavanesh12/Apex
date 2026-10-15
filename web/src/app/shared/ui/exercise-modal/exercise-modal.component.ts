import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ExerciseItem } from '../../../core/services/workout.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-exercise-modal',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (exercise) {
      <div class="modal-backdrop" (click)="close()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <!-- Header Bar -->
          <div class="modal-header">
            <div class="header-left">
              <span class="category-badge">{{ exercise.category }}</span>
              <span class="difficulty-badge" [class]="exercise.difficulty?.toLowerCase() || 'intermediate'">
                {{ exercise.difficulty || 'Intermediate' }}
              </span>
            </div>
            <button class="close-btn" (click)="close()" title="Close guide">
              <app-icon name="close" [size]="18" />
            </button>
          </div>

          <!-- Main Content Grid -->
          <div class="modal-body">
            <!-- Left: 3D Video / Motion Showcase Container -->
            <div class="media-container">
              <div class="video-frame">
                <!-- If video source is available, render video; otherwise animated poster -->
                <img
                  [src]="exercise.videoUrl || exercise.image"
                  [alt]="exercise.name"
                  class="demo-media"
                />

                <!-- 3D Form Overlay Tag -->
                <div class="overlay-badge">
                  <span class="dot-pulse"></span>
                  <span>3D Motion Demonstration</span>
                </div>

                <!-- Play / Loop Control Pill -->
                <div class="media-controls">
                  <button class="ctrl-btn" (click)="togglePlay()" [title]="isPlaying() ? 'Pause' : 'Play'">
                    <app-icon [name]="isPlaying() ? 'minus' : 'play'" [size]="14" />
                    <span>{{ isPlaying() ? 'PAUSE LOOP' : 'PLAY LOOP' }}</span>
                  </button>
                  <span class="fps-tag">60 FPS · ANATOMICAL</span>
                </div>
              </div>

              <!-- Muscle Targeting Heatmap Strip -->
              <div class="muscle-strip">
                <div class="muscle-group">
                  <span class="m-label">PRIMARY TARGET</span>
                  <span class="m-name primary-muscle">{{ exercise.muscle }}</span>
                </div>
                @if (exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0) {
                  <div class="muscle-group">
                    <span class="m-label">SECONDARY ASSIST</span>
                    <span class="m-name">{{ exercise.secondaryMuscles.join(', ') }}</span>
                  </div>
                }
                <div class="muscle-group">
                  <span class="m-label">EQUIPMENT</span>
                  <span class="m-name">{{ exercise.equipment }}</span>
                </div>
              </div>
            </div>

            <!-- Right: Instructions & Form Cues -->
            <div class="info-container">
              <div class="title-section">
                <h2 class="ex-title">{{ exercise.name }}</h2>
                <div class="target-meta">
                  <span class="meta-item">
                    <strong>Standard Target:</strong> {{ exercise.targetSetsReps }}
                  </span>
                  <span class="meta-dot">·</span>
                  <span class="meta-item">
                    <strong>Current PR:</strong> {{ exercise.prKg > 0 ? exercise.prKg + ' kg' : 'Bodyweight' }}
                  </span>
                </div>
              </div>

              <div class="description-section">
                <p>{{ exercise.description }}</p>
              </div>

              <!-- Biomechanical Form Cues -->
              <div class="cues-section">
                <h4 class="cues-heading">
                  <app-icon name="check" [size]="16" color="var(--primary)" />
                  <span>Key Biomechanical Form Cues</span>
                </h4>
                <ul class="cues-list">
                  @for (cue of exercise.formCues || defaultCues; track cue) {
                    <li class="cue-item">
                      <span class="cue-bullet"></span>
                      <span>{{ cue }}</span>
                    </li>
                  }
                </ul>
              </div>

              <!-- Action Footer -->
              <div class="modal-footer">
                <button class="btn btn-primary add-btn" (click)="onSelectExercise()">
                  <app-icon name="plus" [size]="16" />
                  <span>Add to Today's Workout</span>
                </button>
                <button class="btn btn-secondary" (click)="close()">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.82);
      backdrop-filter: blur(8px);
      z-index: 1100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--s-4);
      animation: fadeIn 0.15s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-dialog {
      background: var(--surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--r-card);
      width: 100%;
      max-width: 920px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--s-3) var(--s-5);
      border-bottom: 1px solid var(--border);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .category-badge {
      background: var(--primary-soft);
      border: 1px solid var(--primary-line);
      color: var(--primary);
      padding: 3px 10px;
      border-radius: var(--r-pill);
      font-size: var(--fs-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .difficulty-badge {
      padding: 3px 10px;
      border-radius: var(--r-pill);
      font-size: var(--fs-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .difficulty-badge.beginner {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .difficulty-badge.intermediate {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .difficulty-badge.advanced {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .close-btn {
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--t-fast) var(--ease);
    }
    .close-btn:hover {
      color: var(--text);
      border-color: var(--border-strong);
    }

    .modal-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-5);
      padding: var(--s-5);
    }

    .media-container {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .video-frame {
      position: relative;
      border-radius: var(--r-input);
      overflow: hidden;
      aspect-ratio: 9 / 12;
      max-height: 440px;
      background: #000;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .demo-media {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .overlay-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(11, 16, 21, 0.85);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: var(--r-pill);
      padding: 5px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text);
      letter-spacing: 0.05em;
    }
    .dot-pulse {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 8px var(--primary);
    }

    .media-controls {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(11, 16, 21, 0.85);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: var(--r-pill);
      padding: 6px 14px;
    }
    .ctrl-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.7rem;
      font-weight: 800;
      cursor: pointer;
    }
    .fps-tag {
      font-size: 0.65rem;
      color: var(--text-faint);
      font-family: monospace;
    }

    .muscle-strip {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-2);
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-input);
      padding: var(--s-3);
    }
    .muscle-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .m-label {
      font-size: 0.65rem;
      color: var(--text-faint);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .m-name {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text);
    }
    .primary-muscle {
      color: var(--primary);
    }

    .info-container {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .title-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ex-title {
      font-size: clamp(1.3rem, 2vw, 1.6rem);
      line-height: 1.2;
    }
    .target-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: var(--fs-xs);
      color: var(--text-muted);
    }
    .target-meta strong {
      color: var(--text);
    }
    .meta-dot {
      color: var(--text-faint);
    }

    .description-section {
      font-size: var(--fs-sm);
      color: var(--text-muted);
      line-height: 1.5;
    }

    .cues-section {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-input);
      padding: var(--s-4);
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .cues-heading {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: var(--fs-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text);
    }
    .cues-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .cue-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: var(--fs-xs);
      color: var(--text-muted);
      line-height: 1.4;
    }
    .cue-bullet {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--primary);
      margin-top: 6px;
      flex-shrink: 0;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      margin-top: auto;
      padding-top: var(--s-2);
    }
    .add-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .modal-body {
        grid-template-columns: 1fr;
      }
      .video-frame {
        max-height: 320px;
      }
    }
  `]
})
export class ExerciseModalComponent {
  @Input() exercise: ExerciseItem | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() selected = new EventEmitter<ExerciseItem>();

  isPlaying = signal<boolean>(true);

  defaultCues = [
    'Maintain a neutral spine and engage your core throughout the movement.',
    'Control the eccentric (lowering) phase for 2 to 3 seconds.',
    'Drive aggressively through the working muscles without momentum.',
    'Breathe in on the descent and exhale forcefully on the exertion.'
  ];

  togglePlay() {
    this.isPlaying.update(p => !p);
  }

  close() {
    this.closed.emit();
  }

  onSelectExercise() {
    if (this.exercise) {
      this.selected.emit(this.exercise);
      this.close();
    }
  }
}
