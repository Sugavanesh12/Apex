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
      @for (tab of tabs; track tab.route) {
        <a
          [routerLink]="tab.route"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: tab.route === '/overview' }"
          class="nav-tab"
        >
          <app-icon [name]="tab.icon" [size]="20" />
          <span class="tab-label">{{ tab.label }}</span>
        </a>
      }
    </nav>
  `,
  styles: [`
    :host {
      display: none;
    }
    @media (max-width: 600px) {
      :host {
        display: block;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: var(--tabbar-h);
        background: rgba(11, 16, 21, 0.95);
        backdrop-filter: blur(12px);
        border-top: 1px solid var(--border);
        z-index: 50;
      }
      .bottom-nav {
        display: flex;
        align-items: center;
        justify-content: space-around;
        height: 100%;
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
        padding: 8px 12px;
        border-radius: var(--r-pill);
        min-width: 48px;
        transition: color var(--t-fast) var(--ease);
      }
      .nav-tab.active {
        color: var(--primary);
      }
      .nav-tab.active app-icon {
        color: var(--primary) !important;
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
