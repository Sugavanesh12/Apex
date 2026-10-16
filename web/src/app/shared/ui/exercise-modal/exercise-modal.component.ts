import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, signal } from '@angular/core';
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
            <div class="view-mode-tabs">
              @if (exercise.videoUrl) {
                <button
                  class="mode-tab"
                  [class.active]="viewMode() === 'video'"
                  (click)="setViewMode('video')"
                  title="Watch HD Video demonstration"
                >
                  <app-icon name="play" [size]="13" />
                  <span>Video Demonstration</span>
                </button>
              }
              <button
                class="mode-tab"
                [class.active]="viewMode() === 'biomechanical'"
                (click)="setViewMode('biomechanical')"
                title="Inspect 3D Biomechanical Kinetic joints"
              >
                <app-icon name="zap" [size]="13" />
                <span>3D Kinetic Angles</span>
              </button>
            </div>
            <button class="close-btn" (click)="close()" title="Close guide">
              <app-icon name="close" [size]="18" />
            </button>
          </div>

          <!-- Main Content Grid -->
          <div class="modal-body">
            <!-- Left: HD Video / 3D Kinetic Motion Container -->
            <div class="media-container">
              <div class="video-frame">
                <!-- Video Stream Mode -->
                @if (viewMode() === 'video' && exercise.videoUrl) {
                  <video
                    #videoPlayer
                    [src]="exercise.videoUrl"
                    [poster]="exercise.image"
                    autoplay
                    loop
                    [muted]="isMuted()"
                    playsinline
                    class="demo-media"
                    (click)="togglePlay()"
                  ></video>
                } @else {
                  <!-- 3D Biomechanical Canvas Mode -->
                  <canvas #kineticsCanvas class="demo-media kinetics-canvas"></canvas>
                }

                <!-- Status Overlay Tag -->
                <div class="overlay-badge">
                  <span class="dot-pulse"></span>
                  <span>{{ viewMode() === 'video' ? 'HD Real-Time Video Loop' : '3D Biomechanical Skeletal Tracking' }}</span>
                </div>

                <!-- Live Biomechanics Angle / Depth Indicator -->
                <div class="depth-hud">
                  <span class="hud-metric">{{ currentAngleLabel() }}</span>
                  <span class="hud-status" [class.success]="isAtDepth()">{{ isAtDepth() ? 'DEPTH VERIFIED' : 'ACTIVE RANGE' }}</span>
                </div>

                <!-- Video / Motion Control Strip -->
                <div class="media-controls">
                  <div class="ctrl-left">
                    <button class="ctrl-btn" (click)="togglePlay()" [title]="isPlaying() ? 'Pause' : 'Play'">
                      <app-icon [name]="isPlaying() ? 'minus' : 'play'" [size]="14" />
                      <span>{{ isPlaying() ? 'PAUSE' : 'PLAY' }}</span>
                    </button>
                    @if (viewMode() === 'video') {
                      <button class="ctrl-btn" (click)="toggleMute()" [title]="isMuted() ? 'Unmute audio' : 'Mute audio'">
                        <app-icon name="bell" [size]="14" />
                        <span>{{ isMuted() ? 'UNMUTE' : 'MUTED' }}</span>
                      </button>
                    }
                    <button class="ctrl-btn speed-btn" (click)="cycleSpeed()" title="Cycle playback speed">
                      <span>{{ playbackSpeed() }}x</span>
                    </button>
                  </div>
                  <div class="ctrl-right">
                    <span class="fps-tag">60 FPS · ANATOMICAL</span>
                  </div>
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
                    <strong>Personal Record:</strong> {{ exercise.prKg > 0 ? exercise.prKg + ' kg' : 'Bodyweight' }}
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
      max-width: 960px;
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
      gap: var(--s-3);
      padding: var(--s-3) var(--s-5);
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--s-2);
    }

    .view-mode-tabs {
      display: flex;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 3px;
      gap: 3px;
    }

    .mode-tab {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: var(--r-pill);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .mode-tab:hover {
      color: var(--text);
    }

    .mode-tab.active {
      background: var(--surface-elevated);
      color: var(--primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    }

    .category-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--primary);
      background: var(--primary-glow);
      padding: 3px 10px;
      border-radius: var(--r-pill);
    }

    .difficulty-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: var(--r-pill);
      background: var(--surface-2);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }
    .difficulty-badge.advanced {
      color: var(--accent-3);
      border-color: rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.1);
    }
    .difficulty-badge.intermediate {
      color: var(--accent-2);
      border-color: rgba(245, 158, 11, 0.3);
      background: rgba(245, 158, 11, 0.1);
    }

    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: var(--s-1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s;
    }
    .close-btn:hover {
      color: var(--text);
    }

    .modal-body {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: var(--s-6);
      padding: var(--s-6);
    }

    .media-container {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }

    .video-frame {
      position: relative;
      background: #000;
      border-radius: var(--r-lg);
      overflow: hidden;
      aspect-ratio: 16 / 10;
      border: 1px solid var(--border-strong);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.8);
    }

    .demo-media {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .kinetics-canvas {
      background: radial-gradient(circle at center, #14171d 0%, #07090c 100%);
    }

    .overlay-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      padding: 4px 10px;
      border-radius: var(--r-pill);
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.04em;
      border: 1px solid rgba(255, 255, 255, 0.15);
      z-index: 2;
    }

    .dot-pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 8px var(--primary);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .depth-hud {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      padding: 4px 10px;
      border-radius: var(--r-pill);
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      font-size: 11px;
      z-index: 2;
    }
    .hud-metric {
      color: #e2e8f0;
      font-family: var(--font-mono, monospace);
      font-weight: 700;
    }
    .hud-status {
      font-size: 9px;
      font-weight: 800;
      color: var(--accent-2);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .hud-status.success {
      color: var(--primary);
    }

    .media-controls {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: none;
      z-index: 2;
    }

    .ctrl-left {
      display: flex;
      align-items: center;
      gap: 6px;
      pointer-events: auto;
    }
    .ctrl-right {
      pointer-events: auto;
    }

    .ctrl-btn {
      background: rgba(0, 0, 0, 0.78);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      padding: 5px 12px;
      border-radius: var(--r-pill);
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }
    .ctrl-btn:hover {
      background: rgba(0, 0, 0, 0.95);
      border-color: var(--primary);
      color: var(--primary);
    }
    .btn-icon-only {
      padding: 6px 9px;
    }
    .speed-btn {
      min-width: 44px;
      justify-content: center;
    }

    .fps-tag {
      font-size: 10px;
      font-family: var(--font-mono, monospace);
      font-weight: 700;
      color: rgba(255, 255, 255, 0.6);
      background: rgba(0, 0, 0, 0.6);
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .muscle-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: var(--s-2);
      background: var(--surface-2);
      padding: var(--s-3);
      border-radius: var(--r-md);
      border: 1px solid var(--border);
    }

    .muscle-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .m-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .m-name {
      font-size: 12px;
      font-weight: 600;
      color: var(--text);
    }

    .m-name.primary-muscle {
      color: var(--primary);
      font-weight: 700;
    }

    .info-container {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }

    .ex-title {
      font-size: 22px;
      font-weight: 800;
      color: var(--text);
      letter-spacing: -0.02em;
      margin: 0 0 var(--s-1) 0;
    }

    .target-meta {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      font-size: 13px;
      color: var(--text-muted);
    }

    .meta-item strong {
      color: var(--text);
    }

    .meta-dot {
      color: var(--border-strong);
    }

    .description-section p {
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-muted);
      margin: 0;
    }

    .cues-section {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: var(--s-4);
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }

    .cues-heading {
      font-size: 13px;
      font-weight: 700;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: var(--s-2);
      margin: 0;
    }

    .cues-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }

    .cue-item {
      display: flex;
      align-items: flex-start;
      gap: var(--s-2);
      font-size: 12px;
      line-height: 1.5;
      color: var(--text);
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
      padding-top: var(--s-3);
    }

    .btn {
      padding: var(--s-3) var(--s-4);
      border-radius: var(--r-md);
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--s-2);
      transition: all 0.15s ease;
      border: none;
    }

    .btn-primary {
      background: var(--primary);
      color: #000;
      flex: 1;
    }
    .btn-primary:hover {
      box-shadow: 0 4px 16px var(--primary-glow);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: var(--surface-2);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: var(--surface-elevated);
    }

    @media (max-width: 768px) {
      .modal-backdrop {
        padding: 8px;
      }
      .modal-dialog {
        max-height: 94vh;
      }
      .modal-body {
        grid-template-columns: 1fr;
        padding: var(--s-3);
        gap: var(--s-3);
      }
      .video-frame {
        max-height: 220px;
      }
      .modal-header {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        padding: var(--s-3);
      }
      .header-left {
        justify-content: space-between;
      }
      .view-mode-tabs {
        width: 100%;
      }
      .mode-tab {
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class ExerciseModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() exercise: ExerciseItem | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() selected = new EventEmitter<ExerciseItem>();

  @ViewChild('videoPlayer') videoPlayerRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('kineticsCanvas') kineticsCanvasRef?: ElementRef<HTMLCanvasElement>;

  viewMode = signal<'video' | 'biomechanical'>('video');
  isPlaying = signal<boolean>(true);
  isMuted = signal<boolean>(true);
  playbackSpeed = signal<number>(1.0);
  currentAngleLabel = signal<string>('Knee: 165°');
  isAtDepth = signal<boolean>(false);

  private animFrameId: number | null = null;
  private animPhase = 0;

  defaultCues = [
    'Maintain a neutral spine and engage your core throughout the movement.',
    'Control the eccentric (lowering) phase for 2 to 3 seconds.',
    'Drive aggressively through the working muscles without momentum.',
    'Breathe in on the descent and exhale forcefully on the exertion.'
  ];

  ngOnInit() {
    if (!this.exercise?.videoUrl) {
      this.viewMode.set('biomechanical');
    }
  }

  ngAfterViewInit() {
    this.startCanvasAnimationLoop();
  }

  ngOnDestroy() {
    this.stopCanvasAnimationLoop();
  }

  setViewMode(mode: 'video' | 'biomechanical') {
    this.viewMode.set(mode);
    if (mode === 'biomechanical') {
      setTimeout(() => this.startCanvasAnimationLoop(), 50);
    } else {
      setTimeout(() => {
        if (this.videoPlayerRef && this.isPlaying()) {
          this.videoPlayerRef.nativeElement.play().catch(() => {});
        }
      }, 50);
    }
  }

  togglePlay() {
    const next = !this.isPlaying();
    this.isPlaying.set(next);

    if (this.videoPlayerRef?.nativeElement) {
      if (next) {
        this.videoPlayerRef.nativeElement.play().catch(() => {});
      } else {
        this.videoPlayerRef.nativeElement.pause();
      }
    }
  }

  toggleMute() {
    this.isMuted.update(m => !m);
    if (this.videoPlayerRef?.nativeElement) {
      this.videoPlayerRef.nativeElement.muted = this.isMuted();
    }
  }

  cycleSpeed() {
    const speeds = [0.5, 1.0, 1.5];
    const current = this.playbackSpeed();
    const nextIdx = (speeds.indexOf(current) + 1) % speeds.length;
    const next = speeds[nextIdx];
    this.playbackSpeed.set(next);

    if (this.videoPlayerRef?.nativeElement) {
      this.videoPlayerRef.nativeElement.playbackRate = next;
    }
  }

  close() {
    this.stopCanvasAnimationLoop();
    this.closed.emit();
  }

  onSelectExercise() {
    if (this.exercise) {
      this.selected.emit(this.exercise);
      this.close();
    }
  }

  // ----------------------------------------------------
  // Real-Time 60 FPS Biomechanical Kinetics Engine
  // ----------------------------------------------------
  private startCanvasAnimationLoop() {
    this.stopCanvasAnimationLoop();
    const loop = () => {
      this.renderKineticsFrame();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private stopCanvasAnimationLoop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private renderKineticsFrame() {
    if (!this.kineticsCanvasRef?.nativeElement) return;
    const canvas = this.kineticsCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth || 480;
      canvas.height = canvas.clientHeight || 300;
    }

    const w = canvas.width;
    const h = canvas.height;

    // Advance phase if playing
    if (this.isPlaying()) {
      this.animPhase += 0.025 * this.playbackSpeed();
      if (this.animPhase > Math.PI * 2) {
        this.animPhase -= Math.PI * 2;
      }
    }

    ctx.clearRect(0, 0, w, h);

    // Draw coordinate grid floor
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Kinematic motion profile selection
    const kType = this.exercise?.kinematicType || 'squat';
    const cycle = (Math.sin(this.animPhase) + 1) / 2; // 0 (start) to 1 (full bottom)

    const cx = w * 0.5;
    const groundY = h * 0.85;

    // Ground plane line
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 140, groundY);
    ctx.lineTo(cx + 140, groundY);
    ctx.stroke();

    if (kType === 'bench') {
      this.renderBenchKinematics(ctx, cx, groundY, cycle);
    } else if (kType === 'overhead') {
      this.renderOverheadKinematics(ctx, cx, groundY, cycle);
    } else if (kType === 'hinge') {
      this.renderHingeKinematics(ctx, cx, groundY, cycle);
    } else if (kType === 'pullup') {
      this.renderPullupKinematics(ctx, cx, groundY, cycle);
    } else if (kType === 'curl' || kType === 'triceps') {
      this.renderArmKinematics(ctx, cx, groundY, cycle, kType);
    } else {
      // Default: Squat / Leg pattern
      this.renderSquatKinematics(ctx, cx, groundY, cycle);
    }
  }

  private renderSquatKinematics(ctx: CanvasRenderingContext2D, cx: number, groundY: number, cycle: number) {
    const depthProgress = cycle; // 0: standing, 1: bottom
    const hipDrop = depthProgress * 65;
    const hipBack = depthProgress * 30;
    const kneeForward = depthProgress * 18;

    const ankleX = cx - 15;
    const ankleY = groundY - 8;
    const kneeX = cx - 20 + kneeForward;
    const kneeY = groundY - 65 + hipDrop * 0.45;
    const hipX = cx - 35 - hipBack;
    const hipY = groundY - 130 + hipDrop;
    const shoulderX = cx - 15 - hipBack * 0.4;
    const shoulderY = hipY - 60;
    const headX = shoulderX + 8;
    const headY = shoulderY - 20;

    // Knee Angle Calculation
    const kneeAngleDeg = Math.round(165 - depthProgress * 80);
    this.currentAngleLabel.set(`Knee: ${kneeAngleDeg}°`);
    this.isAtDepth.set(kneeAngleDeg <= 95);

    // Draw Barbell Line and Midfoot tracking
    const barX = shoulderX + 5;
    const barY = shoulderY + 2;

    // Midfoot vertical guide line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ankleX, groundY - 200);
    ctx.lineTo(ankleX, groundY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Skeleton Bones
    this.drawBone(ctx, ankleX, ankleY, kneeX, kneeY, '#10b981'); // Shin
    this.drawBone(ctx, kneeX, kneeY, hipX, hipY, '#10b981'); // Femur
    this.drawBone(ctx, hipX, hipY, shoulderX, shoulderY, '#3b82f6'); // Spine
    this.drawBone(ctx, shoulderX, shoulderY, headX, headY, '#cbd5e1'); // Neck

    // Joints
    this.drawJoint(ctx, ankleX, ankleY, '#10b981');
    this.drawJoint(ctx, kneeX, kneeY, kneeAngleDeg <= 95 ? '#22c55e' : '#f59e0b');
    this.drawJoint(ctx, hipX, hipY, '#3b82f6');
    this.drawJoint(ctx, shoulderX, shoulderY, '#cbd5e1');

    // Head
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(headX, headY, 11, 0, Math.PI * 2);
    ctx.fill();

    // Barbell Plate
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(barX - 4, barY - 14, 8, 28);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(barX - 25, barY - 2, 50, 4);

    // Angle Arc on Knee
    ctx.strokeStyle = kneeAngleDeg <= 95 ? '#22c55e' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(kneeX, kneeY, 16, Math.PI * 0.5, Math.PI * 1.1);
    ctx.stroke();
  }

  private renderBenchKinematics(ctx: CanvasRenderingContext2D, cx: number, groundY: number, cycle: number) {
    const pressDrop = cycle; // 0: lockout, 1: chest touch
    const elbowDrop = pressDrop * 45;

    // Bench Surface
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 70, groundY - 80, 140, 14);

    const shoulderX = cx - 30;
    const shoulderY = groundY - 86;
    const hipX = cx + 30;
    const hipY = groundY - 86;
    const barY = groundY - 130 + pressDrop * 38;
    const elbowX = cx - 15;
    const elbowY = groundY - 105 + elbowDrop * 0.7;
    const wristX = shoulderX + 10;
    const wristY = barY;

    const elbowAngleDeg = Math.round(170 - pressDrop * 85);
    this.currentAngleLabel.set(`Elbow: ${elbowAngleDeg}°`);
    this.isAtDepth.set(pressDrop > 0.85);

    // Spine & Torso
    this.drawBone(ctx, shoulderX, shoulderY, hipX, hipY, '#3b82f6');
    // Arm
    this.drawBone(ctx, shoulderX, shoulderY, elbowX, elbowY, '#10b981');
    this.drawBone(ctx, elbowX, elbowY, wristX, wristY, '#10b981');

    this.drawJoint(ctx, shoulderX, shoulderY, '#cbd5e1');
    this.drawJoint(ctx, elbowX, elbowY, pressDrop > 0.85 ? '#22c55e' : '#f59e0b');
    this.drawJoint(ctx, wristX, wristY, '#cbd5e1');

    // Barbell
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(wristX - 35, barY - 2, 70, 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(wristX + 30, barY - 12, 6, 24);
    ctx.fillRect(wristX - 36, barY - 12, 6, 24);
  }

  private renderHingeKinematics(ctx: CanvasRenderingContext2D, cx: number, groundY: number, cycle: number) {
    const hingeProg = cycle; // 0: lockout, 1: full bottom stretch
    const hipX = cx - 15 - hingeProg * 35;
    const hipY = groundY - 120 + hingeProg * 25;
    const kneeX = cx - 10;
    const kneeY = groundY - 65;
    const ankleX = cx - 10;
    const ankleY = groundY - 8;
    const shoulderX = hipX + 45 - hingeProg * 10;
    const shoulderY = hipY - 60 + hingeProg * 45;

    const barX = ankleX + 5;
    const barY = groundY - 110 + hingeProg * 75;

    const hipAngleDeg = Math.round(175 - hingeProg * 75);
    this.currentAngleLabel.set(`Hip Hinge: ${hipAngleDeg}°`);
    this.isAtDepth.set(hingeProg > 0.8);

    this.drawBone(ctx, ankleX, ankleY, kneeX, kneeY, '#10b981');
    this.drawBone(ctx, kneeX, kneeY, hipX, hipY, '#10b981');
    this.drawBone(ctx, hipX, hipY, shoulderX, shoulderY, '#3b82f6');
    this.drawBone(ctx, shoulderX, shoulderY, barX, barY, '#cbd5e1'); // Arm hanging to bar

    this.drawJoint(ctx, kneeX, kneeY, '#10b981');
    this.drawJoint(ctx, hipX, hipY, hingeProg > 0.8 ? '#22c55e' : '#f59e0b');
    this.drawJoint(ctx, shoulderX, shoulderY, '#cbd5e1');

    // Barbell & plates
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(barX - 25, barY - 2, 50, 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(barX - 4, barY - 16, 8, 32);
  }

  private renderOverheadKinematics(ctx: CanvasRenderingContext2D, cx: number, groundY: number, cycle: number) {
    const pressProg = 1 - cycle; // 0: at collarbone, 1: lockout
    const barY = groundY - 145 - pressProg * 45;

    const shoulderX = cx;
    const shoulderY = groundY - 135;
    const elbowX = cx - 12 + pressProg * 6;
    const elbowY = groundY - 115 - pressProg * 15;
    const wristX = cx - 6;
    const wristY = barY;

    const armAngleDeg = Math.round(85 + pressProg * 90);
    this.currentAngleLabel.set(`Lockout: ${armAngleDeg}°`);
    this.isAtDepth.set(pressProg > 0.85);

    // Torso & Legs
    this.drawBone(ctx, cx, groundY - 8, cx, groundY - 70, '#10b981');
    this.drawBone(ctx, cx, groundY - 70, cx, shoulderY, '#3b82f6');
    // Arm
    this.drawBone(ctx, shoulderX, shoulderY, elbowX, elbowY, '#10b981');
    this.drawBone(ctx, elbowX, elbowY, wristX, wristY, '#10b981');

    this.drawJoint(ctx, elbowX, elbowY, pressProg > 0.85 ? '#22c55e' : '#f59e0b');
    this.drawJoint(ctx, shoulderX, shoulderY, '#cbd5e1');

    // Barbell
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(wristX - 35, barY - 2, 70, 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(wristX + 30, barY - 12, 6, 24);
    ctx.fillRect(wristX - 36, barY - 12, 6, 24);
  }

  private renderPullupKinematics(ctx: CanvasRenderingContext2D, cx: number, groundY: number, cycle: number) {
    const pullProg = 1 - cycle; // 0: dead hang, 1: chin over bar
    const barY = groundY - 180;
    const shoulderY = barY + 30 + (1 - pullProg) * 45;
    const hipY = shoulderY + 55;

    this.currentAngleLabel.set(`Lat Squeeze: ${Math.round(pullProg * 100)}%`);
    this.isAtDepth.set(pullProg > 0.85);

    // Pull-up bar
    ctx.fillStyle = '#64748b';
    ctx.fillRect(cx - 60, barY - 3, 120, 6);

    // Arms
    this.drawBone(ctx, cx - 30, barY, cx - 22, shoulderY - 8, '#10b981');
    this.drawBone(ctx, cx + 30, barY, cx + 22, shoulderY - 8, '#10b981');
    // Torso
    this.drawBone(ctx, cx, shoulderY, cx, hipY, '#3b82f6');
    // Legs
    this.drawBone(ctx, cx, hipY, cx - 8, hipY + 50, '#10b981');
    this.drawBone(ctx, cx, hipY, cx + 8, hipY + 50, '#10b981');

    this.drawJoint(ctx, cx - 22, shoulderY - 8, pullProg > 0.85 ? '#22c55e' : '#f59e0b');
    this.drawJoint(ctx, cx + 22, shoulderY - 8, pullProg > 0.85 ? '#22c55e' : '#f59e0b');
  }

  private renderArmKinematics(ctx: CanvasRenderingContext2D, cx: number, groundY: number, cycle: number, type: 'curl' | 'triceps') {
    const shoulderX = cx - 15;
    const shoulderY = groundY - 135;
    const elbowX = shoulderX;
    const elbowY = shoulderY + 35;

    let wristX = elbowX;
    let wristY = elbowY + 30;
    let armAngleDeg = 170;

    if (type === 'curl') {
      const curlProg = 1 - cycle;
      armAngleDeg = Math.round(165 - curlProg * 115);
      wristX = elbowX + Math.sin(curlProg * Math.PI * 0.6) * 32;
      wristY = elbowY + Math.cos(curlProg * Math.PI * 0.6) * 32;
      this.currentAngleLabel.set(`Biceps: ${armAngleDeg}°`);
      this.isAtDepth.set(curlProg > 0.85);
    } else {
      const extProg = 1 - cycle;
      armAngleDeg = Math.round(75 + extProg * 90);
      wristX = elbowX + Math.sin(extProg * Math.PI * 0.45) * 30;
      wristY = elbowY + Math.cos(extProg * Math.PI * 0.45) * 30;
      this.currentAngleLabel.set(`Triceps: ${armAngleDeg}°`);
      this.isAtDepth.set(extProg > 0.85);
    }

    // Body
    this.drawBone(ctx, cx, groundY - 8, cx, groundY - 70, '#10b981');
    this.drawBone(ctx, cx, groundY - 70, shoulderX, shoulderY, '#3b82f6');
    // Arm
    this.drawBone(ctx, shoulderX, shoulderY, elbowX, elbowY, '#3b82f6');
    this.drawBone(ctx, elbowX, elbowY, wristX, wristY, '#10b981');

    this.drawJoint(ctx, elbowX, elbowY, this.isAtDepth() ? '#22c55e' : '#f59e0b');
    this.drawJoint(ctx, wristX, wristY, '#cbd5e1');

    // Weight Bell
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(wristX, wristY, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawBone(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  private drawJoint(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
