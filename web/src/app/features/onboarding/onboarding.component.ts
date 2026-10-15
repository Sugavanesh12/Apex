import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { UserService } from '../../core/services/user.service';

interface GoalOption {
  id: string;
  label: string;
  icon: any;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="onboarding-page">
      <header class="ob-header">
        <div class="brand-row">
          <app-icon name="apex-logo" [size]="20" color="var(--primary)" />
          <span class="brand-name">APEX AI Coach</span>
        </div>
        <!-- Progress Bar (From Mockup 2/5) -->
        <div class="progress-bar-bg ob-progress">
          <div class="progress-bar-fill" style="width: 40%; background: var(--primary);"></div>
        </div>
        <div class="step-num">2 / 5</div>
      </header>

      <main class="ob-card card">
        <div class="ob-title-group">
          <h1>Let’s personalize your coaching</h1>
          <p class="ob-sub">Tell us a bit about you so APEX can build a plan that fits your goals and lifestyle.</p>
        </div>

        <!-- Goal Selection Cards (From Reference Mockup) -->
        <div class="goals-grid">
          @for (goal of goals; track goal.id) {
            <button
              class="goal-card"
              [class.selected]="selectedGoal() === goal.id"
              (click)="selectedGoal.set(goal.id)"
            >
              <app-icon [name]="goal.icon" [size]="24" />
              <span class="goal-label">{{ goal.label }}</span>
            </button>
          }
        </div>

        <!-- Experience Level (From Reference Mockup) -->
        <div class="experience-section">
          <label class="exp-title">What’s your experience level?</label>
          <div class="exp-pills">
            @for (lvl of ['Beginner', 'Intermediate', 'Advanced']; track lvl) {
              <button
                class="exp-pill"
                [class.selected]="selectedExperience() === lvl"
                (click)="selectedExperience.set(lvl)"
              >
                {{ lvl }}
              </button>
            }
          </div>
        </div>

        <!-- Continue CTA -->
        <div class="ob-actions">
          <button class="btn btn-primary continue-btn" (click)="continueToPlan()">
            Continue →
          </button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .onboarding-page {
      max-width: 680px;
      margin: var(--s-5) auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      padding: 0 var(--s-3);
    }
    .ob-header {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-name {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: var(--fs-sm);
      letter-spacing: 0.05em;
    }
    .ob-progress {
      height: 4px;
    }
    .step-num {
      align-self: flex-end;
      font-size: var(--fs-xs);
      color: var(--text-faint);
      margin-top: -4px;
    }

    .ob-card {
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
      padding: var(--s-6);
    }
    .ob-title-group h1 {
      font-size: clamp(1.5rem, 3vw, 2rem);
    }
    .ob-sub {
      font-size: var(--fs-sm);
      color: var(--text-muted);
      margin-top: 4px;
      line-height: 1.5;
    }

    /* Goals Grid (From Mockup) */
    .goals-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-3);
    }
    .goal-card {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      padding: var(--s-4);
      border-radius: var(--r-input);
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--t-fast) var(--ease);
      min-height: 64px;
    }
    .goal-card:hover {
      background: var(--surface-3);
      border-color: var(--border-strong);
      color: var(--text);
    }
    .goal-card.selected {
      background: var(--primary-soft);
      border-color: var(--primary);
      color: var(--text);
    }
    .goal-card.selected app-icon {
      color: var(--primary) !important;
    }
    .goal-label {
      font-size: var(--fs-sm);
      font-weight: 700;
    }

    /* Experience Pills */
    .experience-section {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .exp-title {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      font-weight: 600;
    }
    .exp-pills {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--s-2);
    }
    .exp-pill {
      padding: 10px;
      border-radius: var(--r-pill);
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      font-size: var(--fs-xs);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--t-fast) var(--ease);
    }
    .exp-pill:hover {
      color: var(--text);
      background: var(--surface-3);
    }
    .exp-pill.selected {
      background: var(--surface-3);
      border-color: var(--primary);
      color: var(--primary);
    }

    .continue-btn {
      width: 100%;
      padding: 14px;
      font-size: var(--fs-md);
      font-weight: 700;
    }

    @media (max-width: 500px) {
      .goals-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OnboardingComponent {
  user = inject(UserService);
  router = inject(Router);

  selectedGoal = signal('build-muscle');
  selectedExperience = signal('Intermediate');

  goals: GoalOption[] = [
    { id: 'build-muscle', label: 'Build Muscle', icon: 'train' },
    { id: 'get-lean', label: 'Get Lean', icon: 'flame' },
    { id: 'improve-endurance', label: 'Improve Endurance', icon: 'zap' },
    { id: 'feel-healthier', label: 'Feel Healthier', icon: 'heart' }
  ];

  continueToPlan() {
    this.user.profile.update(p => ({
      ...p,
      goal: this.selectedGoal(),
      experience: this.selectedExperience() as any
    }));
    this.router.navigate(['/onboarding/plan-confirmed']);
  }
}
