import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent, IconName } from '../../shared/ui/icon/icon.component';

interface TabItem {
  label: string;
  route: string;
  icon: IconName;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav class="bottom-nav" aria-label="Mobile Navigation">
      <a routerLink="/overview" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-tab">
        <app-icon name="today" [size]="20" />
        <span class="tab-label">Today</span>
      </a>

      <a routerLink="/training" routerLinkActive="active" class="nav-tab">
        <app-icon name="train" [size]="20" />
        <span class="tab-label">Train</span>
      </a>

      <!-- Elevated Center Glowing Start Live Workout Button (from reference) -->
      <a routerLink="/training/session/live" class="center-start-tab" title="Start Live 3D Tracked Workout">
        <div class="start-circle">
          <app-icon name="barbell" [size]="22" color="#052e16" />
        </div>
        <span class="start-label">Start</span>
      </a>

      <a routerLink="/nutrition" routerLinkActive="active" class="nav-tab">
        <app-icon name="fuel" [size]="20" />
        <span class="tab-label">Fuel</span>
      </a>

      <a routerLink="/progress" routerLinkActive="active" class="nav-tab">
        <app-icon name="progress" [size]="20" />
        <span class="tab-label">Progress</span>
      </a>
    </nav>
  `,
  styles: [`
    :host {
      display: none;
    }
    @media (max-width: 768px) {
      :host {
        display: block;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: var(--tabbar-h);
        background: rgba(11, 16, 21, 0.96);
        backdrop-filter: blur(14px);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        z-index: 50;
      }
      .bottom-nav {
        display: flex;
        align-items: center;
        justify-content: space-around;
        height: 100%;
        padding: 0 4px;
        padding-bottom: env(safe-area-inset-bottom, 0);
      }
      .nav-tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        color: var(--text-muted);
        text-decoration: none;
        font-size: 0.65rem;
        font-weight: 500;
        padding: 6px 10px;
        border-radius: var(--r-pill);
        min-width: 44px;
        transition: color var(--t-fast) var(--ease);
      }
      .nav-tab.active {
        color: var(--primary);
      }
      .nav-tab.active app-icon {
        color: var(--primary) !important;
      }

      /* Center Glowing Start Button */
      .center-start-tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        position: relative;
        top: -12px;
        z-index: 55;
      }
      .start-circle {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #22c55e, #16a34a);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 16px rgba(34, 197, 94, 0.55), 0 4px 10px rgba(0, 0, 0, 0.5);
        border: 3px solid #0b1015;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .center-start-tab:active .start-circle {
        transform: scale(0.92);
      }
      .start-label {
        font-size: 0.62rem;
        font-weight: 700;
        color: #22c55e;
        margin-top: 3px;
        letter-spacing: 0.04em;
      }
    }
  `]
})
export class BottomNavComponent {
  tabs: TabItem[] = [
    { label: 'Today', route: '/overview', icon: 'today' },
    { label: 'Train', route: '/training', icon: 'train' },
    { label: 'Fuel', route: '/nutrition', icon: 'fuel' },
    { label: 'Recover', route: '/recovery', icon: 'recover' },
    { label: 'Progress', route: '/progress', icon: 'progress' }
  ];
}
