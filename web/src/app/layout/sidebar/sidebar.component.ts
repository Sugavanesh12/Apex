import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent, IconName } from '../../shared/ui/icon/icon.component';
import { UserService } from '../../core/services/user.service';

interface NavItem {
  label: string;
  route: string;
  icon: IconName;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <aside class="sidebar" aria-label="Main Navigation">
      <!-- Brand Header -->
      <div class="brand">
        <a routerLink="/overview" class="logo-link">
          <app-icon name="apex-logo" [size]="28" color="var(--primary)" />
          <div class="brand-text">
            <span class="brand-name">APEX</span>
            <span class="brand-tag">HIGHER HUMAN POTENTIAL</span>
          </div>
        </a>
      </div>

      <!-- Value Statement -->
      <div class="value-statement">
        <h4>ONE COACH.<br/>EVERY DIMENSION.<br/>A BRIGHTER YOU.</h4>
        <p>Training. Nutrition. Recovery. All unified. Powered by AI. Built for what's next.</p>
      </div>

      <!-- Navigation Links -->
      <nav class="nav-menu">
        <div class="nav-group">
          @for (item of primaryNav; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route === '/overview' }"
              class="nav-link"
            >
              <app-icon [name]="item.icon" [size]="20" />
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </div>

        <div class="nav-divider"></div>

        <div class="nav-group">
          @for (item of secondaryNav; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-link"
            >
              <app-icon [name]="item.icon" [size]="20" />
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </div>
      </nav>

      <!-- Sidebar Footer / Hero graphic -->
      <div class="sidebar-hero">
        <img src="/img/hero-mountain.jpg" alt="Apex Athlete" class="sidebar-thumb" />
        <div class="hero-overlay">
          <p class="hero-quote">SMARTER GUIDANCE<br/>REAL PROGRESS<br/>A STRONGER TOMORROW</p>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .sidebar {
      width: var(--sidebar-w);
      height: 100%;
      background: var(--bg);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: var(--s-4) var(--s-3);
      gap: var(--s-4);
      overflow-y: auto;
    }
    .brand {
      padding: var(--s-2) var(--s-2) 0;
    }
    .logo-link {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      text-decoration: none;
      color: inherit;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-family: var(--font-display);
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: var(--text);
      line-height: 1.1;
    }
    .brand-tag {
      font-size: 0.55rem;
      letter-spacing: 0.18em;
      color: var(--text-muted);
      font-weight: 600;
    }

    .value-statement {
      padding: var(--s-2) var(--s-2);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .value-statement h4 {
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      line-height: 1.3;
      color: var(--text);
    }
    .value-statement p {
      font-size: 0.68rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
      flex: 1;
    }
    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nav-divider {
      height: 1px;
      background: var(--border);
      margin: var(--s-2) var(--s-2);
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      padding: 10px 14px;
      border-radius: var(--r-pill);
      color: var(--text-muted);
      font-weight: 500;
      font-size: var(--fs-sm);
      text-decoration: none;
      transition: all var(--t-fast) var(--ease);
    }
    .nav-link:hover {
      color: var(--text);
      background: var(--surface-2);
    }
    .nav-link.active {
      background: var(--primary);
      color: var(--on-primary);
      font-weight: 700;
      box-shadow: 0 2px 10px -2px var(--primary-soft);
    }
    .nav-link.active app-icon {
      color: var(--on-primary) !important;
    }

    .sidebar-hero {
      position: relative;
      border-radius: var(--r-card);
      overflow: hidden;
      border: 1px solid var(--border);
      margin-top: auto;
      min-height: 140px;
    }
    .sidebar-thumb {
      width: 100%;
      height: 140px;
      object-fit: cover;
      display: block;
      filter: brightness(0.65) contrast(1.1);
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 20%, rgba(11, 16, 21, 0.95) 100%);
      display: flex;
      align-items: flex-end;
      padding: var(--s-3);
    }
    .hero-quote {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text);
      line-height: 1.3;
    }

    @media (max-width: 1023px) {
      .sidebar {
        width: var(--rail-w);
        padding: var(--s-3) var(--s-2);
        align-items: center;
      }
      .brand-text, .value-statement, .nav-label, .sidebar-hero {
        display: none;
      }
      .nav-link {
        padding: 10px;
        justify-content: center;
      }
    }
  `]
})
export class SidebarComponent {
  userService = inject(UserService);

  primaryNav: NavItem[] = [
    { label: 'Today', route: '/overview', icon: 'today' },
    { label: 'Train', route: '/training', icon: 'train' },
    { label: 'Fuel', route: '/nutrition', icon: 'fuel' },
    { label: 'Recover', route: '/recovery', icon: 'recover' },
    { label: 'Progress', route: '/progress', icon: 'progress' }
  ];

  secondaryNav: NavItem[] = [
    { label: 'Library', route: '/training/library', icon: 'library' },
    { label: 'Coach AI', route: '/coach', icon: 'robot' },
    { label: 'Settings', route: '/settings', icon: 'settings' }
  ];
}
