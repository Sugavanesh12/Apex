import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MuscleTarget {
  id: string;
  name: string;
  view: 'front' | 'back' | 'both';
  sets?: number;
}

@Component({
  selector: 'app-muscle-anatomy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="anatomy-container" [class.compact]="compact()">
      <!-- Anatomy SVG Canvas (Front & Back Views) -->
      <div class="bodies-wrap">
        <!-- FRONT / ANTERIOR VIEW -->
        <div class="body-card">
          <div class="view-tag">FRONT (ANTERIOR)</div>
          <svg
            class="anatomy-svg"
            viewBox="0 0 160 320"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Anterior muscle anatomy"
          >
            <defs>
              <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="#22c55e" flood-opacity="0.85" />
              </filter>
              <filter id="subtle-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#10b981" flood-opacity="0.5" />
              </filter>
            </defs>

            <!-- Head & Neck Base -->
            <path d="M72 15 C72 8, 88 8, 88 15 C91 22, 91 32, 88 38 C86 42, 85 46, 85 50 L75 50 C75 46, 74 42, 72 38 C69 32, 69 22, 72 15 Z" class="muscle-base head" />
            <!-- Neck & Traps Front -->
            <path
              d="M74 48 C68 50, 62 55, 54 62 L58 66 C65 60, 71 56, 76 55 Z"
              [class.is-active]="isMuscleActive('traps')"
              (click)="onMuscleClick('traps')"
              class="muscle-path"
            />
            <path
              d="M86 48 C92 50, 98 55, 106 62 L102 66 C95 60, 89 56, 84 55 Z"
              [class.is-active]="isMuscleActive('traps')"
              (click)="onMuscleClick('traps')"
              class="muscle-path"
            />

            <!-- Shoulders (Anterior/Lateral Deltoids) -->
            <path
              d="M50 63 C42 66, 36 75, 34 88 C34 94, 38 97, 43 93 C47 88, 51 80, 52 70 Z"
              [class.is-active]="isMuscleActive('shoulders')"
              (click)="onMuscleClick('shoulders')"
              class="muscle-path"
            />
            <path
              d="M110 63 C118 66, 124 75, 126 88 C126 94, 122 97, 117 93 C113 88, 109 80, 108 70 Z"
              [class.is-active]="isMuscleActive('shoulders')"
              (click)="onMuscleClick('shoulders')"
              class="muscle-path"
            />

            <!-- Chest / Pectoralis Major -->
            <!-- Left Pec -->
            <path
              d="M55 68 C62 67, 72 68, 78 70 C78 78, 77 92, 74 97 C66 99, 53 96, 48 88 C47 80, 51 72, 55 68 Z"
              [class.is-active]="isMuscleActive('chest')"
              (click)="onMuscleClick('chest')"
              class="muscle-path"
            />
            <!-- Right Pec -->
            <path
              d="M105 68 C98 67, 88 68, 82 70 C82 78, 83 92, 86 97 C94 99, 107 96, 112 88 C113 80, 109 72, 105 68 Z"
              [class.is-active]="isMuscleActive('chest')"
              (click)="onMuscleClick('chest')"
              class="muscle-path"
            />

            <!-- Biceps -->
            <path
              d="M34 97 C30 105, 30 118, 32 126 C36 128, 42 125, 43 118 C45 110, 44 100, 41 95 Z"
              [class.is-active]="isMuscleActive('biceps')"
              (click)="onMuscleClick('biceps')"
              class="muscle-path"
            />
            <path
              d="M126 97 C130 105, 130 118, 128 126 C124 128, 118 125, 117 118 C115 110, 116 100, 119 95 Z"
              [class.is-active]="isMuscleActive('biceps')"
              (click)="onMuscleClick('biceps')"
              class="muscle-path"
            />

            <!-- Forearms -->
            <path
              d="M30 132 C26 142, 23 158, 22 170 C24 172, 31 170, 33 162 C37 150, 40 140, 39 133 Z"
              [class.is-active]="isMuscleActive('forearms')"
              (click)="onMuscleClick('forearms')"
              class="muscle-path"
            />
            <path
              d="M130 132 C134 142, 137 158, 138 170 C136 172, 129 170, 127 162 C123 150, 120 140, 121 133 Z"
              [class.is-active]="isMuscleActive('forearms')"
              (click)="onMuscleClick('forearms')"
              class="muscle-path"
            />

            <!-- Hands -->
            <path d="M19 173 C17 180, 19 188, 22 192 C25 192, 28 186, 28 178 Z" class="muscle-base" />
            <path d="M141 173 C143 180, 141 188, 138 192 C135 192, 132 186, 132 178 Z" class="muscle-base" />

            <!-- Abdominals (Rectus Abdominis 6-Pack) -->
            <!-- Upper Abs -->
            <path
              d="M68 102 C72 102, 78 102, 78 111 C74 112, 69 112, 67 111 C67 106, 67 103, 68 102 Z"
              [class.is-active]="isMuscleActive('abs')"
              (click)="onMuscleClick('abs')"
              class="muscle-path"
            />
            <path
              d="M92 102 C88 102, 82 102, 82 111 C86 112, 91 112, 93 111 C93 106, 93 103, 92 102 Z"
              [class.is-active]="isMuscleActive('abs')"
              (click)="onMuscleClick('abs')"
              class="muscle-path"
            />
            <!-- Mid Abs -->
            <path
              d="M67 115 C72 115, 78 115, 78 125 C74 126, 69 126, 66 125 C66 120, 66 117, 67 115 Z"
              [class.is-active]="isMuscleActive('abs')"
              (click)="onMuscleClick('abs')"
              class="muscle-path"
            />
            <path
              d="M93 115 C88 115, 82 115, 82 125 C86 126, 91 126, 94 125 C94 120, 94 117, 93 115 Z"
              [class.is-active]="isMuscleActive('abs')"
              (click)="onMuscleClick('abs')"
              class="muscle-path"
            />
            <!-- Lower Abs -->
            <path
              d="M67 129 C72 129, 78 129, 78 142 C73 143, 68 141, 66 138 C66 133, 66 130, 67 129 Z"
              [class.is-active]="isMuscleActive('abs')"
              (click)="onMuscleClick('abs')"
              class="muscle-path"
            />
            <path
              d="M93 129 C88 129, 82 129, 82 142 C87 143, 92 141, 94 138 C94 133, 94 130, 93 129 Z"
              [class.is-active]="isMuscleActive('abs')"
              (click)="onMuscleClick('abs')"
              class="muscle-path"
            />

            <!-- Obliques -->
            <path
              d="M54 105 C59 105, 63 109, 63 130 C58 135, 54 138, 51 138 C49 128, 50 114, 54 105 Z"
              [class.is-active]="isMuscleActive('obliques')"
              (click)="onMuscleClick('obliques')"
              class="muscle-path"
            />
            <path
              d="M106 105 C101 105, 97 109, 97 130 C102 135, 106 138, 109 138 C111 128, 110 114, 106 105 Z"
              [class.is-active]="isMuscleActive('obliques')"
              (click)="onMuscleClick('obliques')"
              class="muscle-path"
            />

            <!-- Pelvis / Hip Flexors -->
            <path d="M64 144 C72 145, 88 145, 96 144 C93 154, 87 160, 80 162 C73 160, 67 154, 64 144 Z" class="muscle-base" />

            <!-- Quadriceps (Quads) -->
            <!-- Left Quad -->
            <path
              d="M51 154 C59 152, 73 155, 75 168 C76 182, 74 205, 71 224 C64 225, 59 220, 56 210 C50 195, 47 175, 51 154 Z"
              [class.is-active]="isMuscleActive('quads')"
              (click)="onMuscleClick('quads')"
              class="muscle-path"
            />
            <!-- Right Quad -->
            <path
              d="M109 154 C101 152, 87 155, 85 168 C84 182, 86 205, 89 224 C96 225, 101 220, 104 210 C110 195, 113 175, 109 154 Z"
              [class.is-active]="isMuscleActive('quads')"
              (click)="onMuscleClick('quads')"
              class="muscle-path"
            />

            <!-- Knees -->
            <path d="M59 227 C64 227, 69 227, 70 236 C66 238, 61 238, 59 236 Z" class="muscle-base" />
            <path d="M101 227 C96 227, 91 227, 90 236 C94 238, 99 238, 101 236 Z" class="muscle-base" />

            <!-- Calves (Anterior / Tibialis) -->
            <path
              d="M57 240 C63 240, 71 242, 69 262 C67 274, 65 288, 65 296 C61 296, 58 288, 56 276 C54 262, 54 246, 57 240 Z"
              [class.is-active]="isMuscleActive('calves')"
              (click)="onMuscleClick('calves')"
              class="muscle-path"
            />
            <path
              d="M103 240 C97 240, 89 242, 91 262 C93 274, 95 288, 95 296 C99 296, 102 288, 104 276 C106 262, 106 246, 103 240 Z"
              [class.is-active]="isMuscleActive('calves')"
              (click)="onMuscleClick('calves')"
              class="muscle-path"
            />

            <!-- Feet -->
            <path d="M60 299 C64 299, 67 304, 69 313 C64 316, 54 316, 55 309 C56 304, 58 299, 60 299 Z" class="muscle-base" />
            <path d="M100 299 C96 299, 93 304, 91 313 C96 316, 106 316, 105 309 C104 304, 102 299, 100 299 Z" class="muscle-base" />
          </svg>
        </div>

        <!-- BACK / POSTERIOR VIEW -->
        <div class="body-card">
          <div class="view-tag">BACK (POSTERIOR)</div>
          <svg
            class="anatomy-svg"
            viewBox="0 0 160 320"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Posterior muscle anatomy"
          >
            <!-- Head & Back of Neck -->
            <path d="M72 15 C72 8, 88 8, 88 15 C91 22, 91 32, 88 38 C86 42, 85 46, 85 50 L75 50 C75 46, 74 42, 72 38 C69 32, 69 22, 72 15 Z" class="muscle-base head" />

            <!-- Trapezius / Upper Back -->
            <path
              d="M75 50 C68 53, 55 60, 48 68 C56 70, 68 73, 76 74 C79 86, 80 98, 80 102 C80 98, 81 86, 84 74 C92 73, 104 70, 112 68 C105 60, 92 53, 85 50 Z"
              [class.is-active]="isMuscleActive('traps') || isMuscleActive('upper-back')"
              (click)="onMuscleClick('traps')"
              class="muscle-path"
            />

            <!-- Rear Deltoids -->
            <path
              d="M45 68 C38 72, 34 80, 34 90 C38 92, 44 87, 47 79 C48 74, 47 70, 45 68 Z"
              [class.is-active]="isMuscleActive('shoulders') || isMuscleActive('rear-delts')"
              (click)="onMuscleClick('shoulders')"
              class="muscle-path"
            />
            <path
              d="M115 68 C122 72, 126 80, 126 90 C122 92, 116 87, 113 79 C112 74, 113 70, 115 68 Z"
              [class.is-active]="isMuscleActive('shoulders') || isMuscleActive('rear-delts')"
              (click)="onMuscleClick('shoulders')"
              class="muscle-path"
            />

            <!-- Triceps -->
            <path
              d="M33 94 C30 104, 30 118, 32 125 C36 126, 42 122, 43 114 C44 104, 43 96, 39 92 Z"
              [class.is-active]="isMuscleActive('triceps')"
              (click)="onMuscleClick('triceps')"
              class="muscle-path"
            />
            <path
              d="M127 94 C130 104, 130 118, 128 125 C124 126, 118 122, 117 114 C116 104, 117 96, 121 92 Z"
              [class.is-active]="isMuscleActive('triceps')"
              (click)="onMuscleClick('triceps')"
              class="muscle-path"
            />

            <!-- Back Forearms -->
            <path
              d="M30 132 C26 142, 23 158, 22 170 C24 172, 31 170, 33 162 C37 150, 40 140, 39 133 Z"
              [class.is-active]="isMuscleActive('forearms')"
              (click)="onMuscleClick('forearms')"
              class="muscle-path"
            />
            <path
              d="M130 132 C134 142, 137 158, 138 170 C136 172, 129 170, 127 162 C123 150, 120 140, 121 133 Z"
              [class.is-active]="isMuscleActive('forearms')"
              (click)="onMuscleClick('forearms')"
              class="muscle-path"
            />

            <!-- Latissimus Dorsi (Lats) -->
            <!-- Left Lat -->
            <path
              d="M50 78 C48 90, 49 108, 54 124 C62 125, 72 124, 76 112 C77 98, 70 82, 50 78 Z"
              [class.is-active]="isMuscleActive('lats') || isMuscleActive('back')"
              (click)="onMuscleClick('lats')"
              class="muscle-path"
            />
            <!-- Right Lat -->
            <path
              d="M110 78 C112 90, 111 108, 106 124 C98 125, 88 124, 84 112 C83 98, 90 82, 110 78 Z"
              [class.is-active]="isMuscleActive('lats') || isMuscleActive('back')"
              (click)="onMuscleClick('lats')"
              class="muscle-path"
            />

            <!-- Lower Back / Erector Spinae -->
            <path
              d="M68 120 C73 120, 78 121, 78 143 C73 144, 68 143, 67 141 C66 133, 66 124, 68 120 Z"
              [class.is-active]="isMuscleActive('lower-back') || isMuscleActive('back')"
              (click)="onMuscleClick('lower-back')"
              class="muscle-path"
            />
            <path
              d="M92 120 C87 120, 82 121, 82 143 C87 144, 92 143, 93 141 C94 133, 94 124, 92 120 Z"
              [class.is-active]="isMuscleActive('lower-back') || isMuscleActive('back')"
              (click)="onMuscleClick('lower-back')"
              class="muscle-path"
            />

            <!-- Gluteus Maximus (Glutes) -->
            <!-- Left Glute -->
            <path
              d="M51 146 C60 144, 76 145, 78 160 C78 178, 73 194, 65 196 C56 195, 49 184, 48 168 C48 156, 49 149, 51 146 Z"
              [class.is-active]="isMuscleActive('glutes')"
              (click)="onMuscleClick('glutes')"
              class="muscle-path"
            />
            <!-- Right Glute -->
            <path
              d="M109 146 C100 144, 84 145, 82 160 C82 178, 87 194, 95 196 C104 195, 111 184, 112 168 C112 156, 111 149, 109 146 Z"
              [class.is-active]="isMuscleActive('glutes')"
              (click)="onMuscleClick('glutes')"
              class="muscle-path"
            />

            <!-- Hamstrings -->
            <!-- Left Hamstring -->
            <path
              d="M51 200 C58 198, 72 201, 74 212 C75 224, 72 242, 69 254 C62 254, 57 248, 54 238 C50 224, 49 210, 51 200 Z"
              [class.is-active]="isMuscleActive('hamstrings')"
              (click)="onMuscleClick('hamstrings')"
              class="muscle-path"
            />
            <!-- Right Hamstring -->
            <path
              d="M109 200 C102 198, 88 201, 86 212 C85 224, 88 242, 91 254 C98 254, 103 248, 106 238 C110 224, 111 210, 109 200 Z"
              [class.is-active]="isMuscleActive('hamstrings')"
              (click)="onMuscleClick('hamstrings')"
              class="muscle-path"
            />

            <!-- Back of Knees -->
            <path d="M59 256 C64 256, 68 256, 68 262 C64 264, 60 264, 59 262 Z" class="muscle-base" />
            <path d="M101 256 C96 256, 92 256, 92 262 C96 264, 100 264, 101 262 Z" class="muscle-base" />

            <!-- Calves (Posterior Gastrocnemius / Soleus) -->
            <path
              d="M55 264 C62 263, 71 265, 70 280 C68 290, 65 298, 64 304 C61 304, 57 296, 55 286 C53 276, 53 268, 55 264 Z"
              [class.is-active]="isMuscleActive('calves')"
              (click)="onMuscleClick('calves')"
              class="muscle-path"
            />
            <path
              d="M105 264 C98 263, 89 265, 90 280 C92 290, 95 298, 96 304 C99 304, 103 296, 105 286 C107 276, 107 268, 105 264 Z"
              [class.is-active]="isMuscleActive('calves')"
              (click)="onMuscleClick('calves')"
              class="muscle-path"
            />

            <!-- Heels -->
            <path d="M60 307 C64 307, 66 312, 67 317 C62 318, 57 318, 58 313 C59 310, 59 307, 60 307 Z" class="muscle-base" />
            <path d="M100 307 C96 307, 94 312, 93 317 C98 318, 103 318, 102 313 C101 310, 101 307, 100 307 Z" class="muscle-base" />
          </svg>
        </div>
      </div>

      <!-- Interactive Targeted Muscle Chips (Below Diagram) -->
      @if (showChips() && activeTargets().length > 0) {
        <div class="target-chips-deck">
          <div class="chips-title">TARGETED MUSCLE GROUPS:</div>
          <div class="chips-row">
            @for (m of activeTargets(); track m.id) {
              <button
                type="button"
                class="muscle-chip"
                [class.selected]="selectedMuscle() === m.id"
                (click)="onMuscleClick(m.id)"
              >
                <span class="chip-dot"></span>
                <span class="chip-label">{{ m.name }}</span>
                @if (m.sets) {
                  <span class="chip-sets">{{ m.sets }}s</span>
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .anatomy-container {
      background: #0d1218;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--r-xl, 16px);
      padding: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;
    }

    .bodies-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      width: 100%;
      max-width: 440px;
    }

    .body-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      flex: 1;
      max-width: 180px;
    }

    .view-tag {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.04);
      padding: 3px 8px;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .anatomy-svg {
      width: 100%;
      height: auto;
      max-height: 270px;
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
    }

    /* Muscle styling */
    .muscle-base {
      fill: #1a222c;
      stroke: #2d3748;
      stroke-width: 0.8;
      transition: fill 0.25s ease, stroke 0.25s ease;
    }

    .muscle-base.head {
      fill: #161c24;
      stroke: #252e3b;
    }

    .muscle-path {
      fill: #222c38;
      stroke: #334155;
      stroke-width: 0.9;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .muscle-path:hover {
      fill: #2f3e50;
      stroke: #64748b;
    }

    /* Active targeted muscle highlights (Neon Green from Reference) */
    .muscle-path.is-active {
      fill: #22c55e !important;
      stroke: #4ade80 !important;
      stroke-width: 1.2;
      filter: url(#neon-glow);
      animation: pulse-muscle 2.5s infinite alternate;
    }

    @keyframes pulse-muscle {
      0% {
        fill: #16a34a;
        stroke: #22c55e;
      }
      100% {
        fill: #22c55e;
        stroke: #86efac;
      }
    }

    /* Targeted Muscle Chips below */
    .target-chips-deck {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 100%;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 12px;
    }

    .chips-title {
      font-size: 0.65rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.08em;
    }

    .chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
    }

    .muscle-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #86efac;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .muscle-chip:hover,
    .muscle-chip.selected {
      background: #22c55e;
      color: #052e16;
      border-color: #4ade80;
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
    }

    .chip-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
    }

    .muscle-chip.selected .chip-dot {
      background: #052e16;
    }

    .chip-sets {
      font-size: 0.65rem;
      opacity: 0.8;
      background: rgba(0, 0, 0, 0.25);
      padding: 1px 5px;
      border-radius: 6px;
    }

    /* Compact variant */
    .compact {
      padding: 10px;
    }
    .compact .anatomy-svg {
      max-height: 200px;
    }

    @media (max-width: 480px) {
      .bodies-wrap {
        gap: 10px;
      }
      .anatomy-svg {
        max-height: 220px;
      }
    }
  `]
})
export class MuscleAnatomyComponent {
  /** Array of active muscles (e.g. ['quads', 'glutes', 'hamstrings', 'chest', 'shoulders', 'triceps', 'lats', 'biceps', 'abs']) */
  muscles = input<string[]>([]);

  /** Flag to show chips below anatomy */
  showChips = input<boolean>(true);

  /** Compact mode flag */
  compact = input<boolean>(false);

  /** Currently selected/focused muscle */
  selectedMuscle = input<string | null>(null);

  /** Output event when a user clicks a muscle */
  muscleClick = output<string>();

  /** Computed normalized set of active muscles */
  activeSet = computed(() => {
    const set = new Set<string>();
    const rawList = this.muscles() || [];
    for (const raw of rawList) {
      if (!raw) continue;
      const lower = raw.toLowerCase();
      if (lower.includes('quad') || lower.includes('squat') || lower.includes('leg ext') || lower.includes('lunge')) {
        set.add('quads');
      }
      if (lower.includes('hamstring') || lower.includes('rdl') || lower.includes('deadlift') || lower.includes('leg curl')) {
        set.add('hamstrings');
      }
      if (lower.includes('glute') || lower.includes('thrust') || lower.includes('bridge') || lower.includes('squat')) {
        set.add('glutes');
      }
      if (lower.includes('chest') || lower.includes('bench') || lower.includes('pec') || lower.includes('pushup') || lower.includes('fly')) {
        set.add('chest');
      }
      if (lower.includes('shoulder') || lower.includes('delt') || lower.includes('press') || lower.includes('lateral')) {
        set.add('shoulders');
      }
      if (lower.includes('tricep') || lower.includes('pushdown') || lower.includes('dip') || lower.includes('skull')) {
        set.add('triceps');
      }
      if (lower.includes('bicep') || lower.includes('curl') || lower.includes('chin')) {
        set.add('biceps');
      }
      if (lower.includes('lat') || lower.includes('pull') || lower.includes('row')) {
        set.add('lats');
        set.add('back');
      }
      if (lower.includes('trap') || lower.includes('shrug') || lower.includes('upper back')) {
        set.add('traps');
        set.add('upper-back');
      }
      if (lower.includes('erector') || lower.includes('lower back') || lower.includes('posterior chain')) {
        set.add('lower-back');
      }
      if (lower.includes('core') || lower.includes('ab') || lower.includes('plank') || lower.includes('crunch') || lower.includes('sit-up')) {
        set.add('abs');
        set.add('obliques');
      }
      if (lower.includes('calf') || lower.includes('calves')) {
        set.add('calves');
      }
      if (lower.includes('forearm') || lower.includes('grip')) {
        set.add('forearms');
      }
    }
    return set;
  });

  /** Computed list of formatted active target chips with display names */
  activeTargets = computed<MuscleTarget[]>(() => {
    const set = this.activeSet();
    const result: MuscleTarget[] = [];
    const mapping: Record<string, { name: string; view: 'front' | 'back' | 'both' }> = {
      chest: { name: 'Chest', view: 'front' },
      quads: { name: 'Quads', view: 'front' },
      shoulders: { name: 'Shoulders', view: 'both' },
      glutes: { name: 'Glutes', view: 'back' },
      hamstrings: { name: 'Hamstrings', view: 'back' },
      lats: { name: 'Lats & Upper Back', view: 'back' },
      triceps: { name: 'Triceps', view: 'back' },
      biceps: { name: 'Biceps', view: 'front' },
      abs: { name: 'Abs & Core', view: 'front' },
      calves: { name: 'Calves', view: 'both' },
      'lower-back': { name: 'Lower Back', view: 'back' },
      forearms: { name: 'Forearms', view: 'both' }
    };

    for (const [key, meta] of Object.entries(mapping)) {
      if (set.has(key)) {
        result.push({
          id: key,
          name: meta.name,
          view: meta.view
        });
      }
    }

    // Default sample if empty so user always sees the anatomy in action
    if (result.length === 0) {
      return [
        { id: 'quads', name: 'Quads', view: 'front' },
        { id: 'glutes', name: 'Glutes', view: 'back' },
        { id: 'hamstrings', name: 'Hamstrings', view: 'back' }
      ];
    }
    return result;
  });

  isMuscleActive(id: string): boolean {
    const selected = this.selectedMuscle();
    if (selected) {
      return selected === id;
    }
    return this.activeSet().has(id);
  }

  onMuscleClick(id: string): void {
    this.muscleClick.emit(id);
  }
}
