import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-plan-confirmed',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="confirmed-page">
      <div class="confirmed-card card">
        <!-- Glowing AI Orb Symbol (From Mockup) -->
        <div class="orb-container">
          <div class="orb-ring outer"></div>
          <div class="orb-ring inner"></div>
          <div class="orb-core">
            <app-icon name="robot" [size]="32" color="var(--primary)" />
          </div>
        </div>

        <div class="confirmed-titles">
          <h1>Plan Confirmed!</h1>
          <p class="confirmed-sub">Your workout, nutrition, and recovery plan is ready. Let’s make it happen.</p>
        </div>

        <!-- Checklist of Configured Capabilities (From Mockup) -->
        <ul class="confirmed-checklist">
          <li>
            <span class="chk-badge">✓</span>
            <span>Personalized training plan</span>
          </li>
          <li>
            <span class="chk-badge">✓</span>
            <span>Daily nutrition targets</span>
          </li>
          <li>
            <span class="chk-badge">✓</span>
            <span>Recovery recommendations</span>
          </li>
          <li>
            <span class="chk-badge">✓</span>
            <span>Progress tracking enabled</span>
          </li>
        </ul>

        <!-- Action Button -->
        <div class="confirmed-actions">
          <button class="btn btn-primary go-btn" (click)="goToDashboard()">
            Let’s Go →
          </button>
          <span class="motto-foot">Smarter training. A stronger you.</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmed-page {
      max-width: 580px;
      margin: var(--s-6) auto;
      display: flex;
      flex-direction: column;
      padding: 0 var(--s-3);
    }
    .confirmed-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: var(--s-6) var(--s-5);
      gap: var(--s-5);
    }

    /* AI Orb Ring */
    .orb-container {
      position: relative;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .orb-ring {
      position: absolute;
      border-radius: 50%;
    }
    .orb-ring.outer {
      inset: 0;
      border: 2px solid var(--accent-1);
      box-shadow: 0 0 24px -4px var(--accent-1);
      animation: pulse-ring 3s infinite ease-in-out;
    }
    .orb-ring.inner {
      inset: 10px;
      border: 2px solid var(--primary);
      box-shadow: 0 0 16px -2px var(--primary);
    }
    .orb-core {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--surface-2);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }
    @keyframes pulse-ring {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.08); opacity: 1; }
    }

    .confirmed-titles h1 {
      font-size: clamp(1.8rem, 3.5vw, 2.3rem);
    }
    .confirmed-sub {
      font-size: var(--fs-sm);
      color: var(--text-muted);
      margin-top: 6px;
      line-height: 1.45;
    }

    .confirmed-checklist {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      max-width: 320px;
      text-align: left;
    }
    .confirmed-checklist li {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: var(--fs-sm);
      color: var(--text);
      font-weight: 500;
    }
    .chk-badge {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--primary);
      color: var(--on-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--fs-xs);
      font-weight: 800;
      flex-shrink: 0;
    }

    .confirmed-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--s-3);
      width: 100%;
      margin-top: var(--s-2);
    }
    .go-btn {
      width: 100%;
      padding: 14px;
      font-size: var(--fs-md);
      font-weight: 700;
    }
    .motto-foot {
      font-size: var(--fs-xs);
      color: var(--text-faint);
      letter-spacing: 0.05em;
    }
  `]
})
export class PlanConfirmedComponent {
  router = inject(Router);

  goToDashboard() {
    this.router.navigate(['/overview']);
  }
}
