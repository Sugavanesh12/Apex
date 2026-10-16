import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { UserService } from '../../core/services/user.service';
import { CoachService } from '../../core/services/coach.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { AuthModalComponent } from '../../shared/ui/auth-modal/auth-modal.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, IconComponent, AuthModalComponent],
  template: `
    <header class="topbar">
      <!-- Search Bar -->
      <div class="search-box">
        <app-icon name="search" [size]="18" color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Ask APEX anything..."
          (focus)="coachService.openCopilot()"
          aria-label="Search or ask APEX"
        />
      </div>

      <!-- Right Actions -->
      <div class="actions">
        <!-- Supabase Cloud Connection Status / Action -->
        @if (supabase.currentUser(); as user) {
          <div class="cloud-pill live" title="Connected as {{ user.email }}">
            <span class="live-dot"></span>
            <span class="pill-label">Cloud Synced</span>
          </div>
        } @else {
          <button class="cloud-pill connect-btn" (click)="showAuthModal.set(true)" title="Sign in or sync to Supabase">
            <app-icon name="cloud" [size]="14" />
            <span class="pill-label">Connect Cloud</span>
          </button>
        }

        <!-- AI Copilot Trigger Button -->
        <button
          class="copilot-btn"
          (click)="coachService.toggleCopilot()"
          [class.active]="coachService.isCopilotOpen()"
          title="Toggle APEX Copilot"
        >
          <span class="copilot-dot"></span>
          <span class="copilot-label">APEX COPILOT</span>
        </button>

        <!-- Notification Bell -->
        <button class="icon-btn" title="Notifications" aria-label="Notifications">
          <app-icon name="bell" [size]="20" />
          <span class="notification-badge"></span>
        </button>

        <!-- User Profile Chip -->
        <a routerLink="/settings" class="user-chip" title="Profile and settings">
          <div class="avatar">{{ userService.profile().name.charAt(0) }}</div>
          <div class="user-info">
            <span class="user-name">{{ userService.profile().name }}</span>
            <span class="user-role">{{ userService.profile().title }}</span>
          </div>
          <app-icon name="chevron-down" [size]="14" color="var(--text-muted)" />
        </a>
      </div>
    </header>

    @if (showAuthModal()) {
      <app-auth-modal (closed)="showAuthModal.set(false)" />
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .topbar {
      height: var(--topbar-h);
      padding: 0 var(--s-5);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-4);
      background: var(--bg);
      border-bottom: 1px solid var(--border);
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 8px 16px;
      width: clamp(240px, 35vw, 420px);
      transition: border-color var(--t-fast) var(--ease);
    }
    .search-box:focus-within {
      border-color: var(--primary);
    }
    .search-box input {
      background: none;
      border: none;
      outline: none;
      color: var(--text);
      font-size: var(--fs-sm);
      width: 100%;
    }
    .search-box input::placeholder {
      color: var(--text-muted);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: var(--s-4);
    }

    .copilot-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      color: var(--text);
      font-size: var(--fs-xs);
      font-weight: 600;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: all var(--t-fast) var(--ease);
    }
    .copilot-btn:hover {
      border-color: var(--primary);
      background: var(--surface-3);
    }
    .copilot-btn.active {
      border-color: var(--primary);
      box-shadow: 0 0 12px -2px var(--primary-soft);
    }
    .copilot-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 6px var(--primary);
    }

    .icon-btn {
      position: relative;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--t-fast) var(--ease);
    }
    .icon-btn:hover {
      color: var(--text);
      border-color: var(--border-strong);
    }
    .notification-badge {
      position: absolute;
      top: 9px;
      right: 9px;
      width: 6px;
      height: 6px;
      background: var(--accent-2);
      border-radius: 50%;
    }

    .user-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 10px 4px 4px;
      border-radius: var(--r-pill);
      background: var(--surface);
      border: 1px solid var(--border);
      text-decoration: none;
      color: inherit;
      transition: border-color var(--t-fast) var(--ease);
    }
    .user-chip:hover {
      border-color: var(--border-strong);
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary-soft);
      border: 1px solid var(--primary-line);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: var(--fs-xs);
    }
    .user-info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .user-name {
      font-size: var(--fs-xs);
      font-weight: 600;
      color: var(--text);
    }
    .cloud-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: var(--r-pill);
      font-size: var(--fs-xs);
      font-weight: 600;
      transition: all var(--t-fast) var(--ease);
    }
    .cloud-pill.live {
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.35);
      color: #22c55e;
    }
    .cloud-pill.connect-btn {
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
    }
    .cloud-pill.connect-btn:hover {
      border-color: var(--primary);
      color: var(--text);
    }
    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 6px #22c55e;
    }
    .offline-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-muted);
    }

    @media (max-width: 768px) {
      .topbar {
        padding: 0 10px;
        gap: 8px;
      }
      .search-box {
        width: auto;
        flex: 1;
        padding: 6px 10px;
        min-width: 0;
        gap: 6px;
      }
      .search-box input {
        font-size: 0.8rem;
        min-width: 0;
      }
      .actions {
        gap: 6px;
        flex-shrink: 0;
      }
      .user-info {
        display: none;
      }
      .user-chip {
        padding: 2px;
        background: transparent;
        border: none;
      }
      .user-chip app-icon {
        display: none;
      }
      .copilot-btn {
        display: none;
      }
      .cloud-pill .pill-label {
        display: none;
      }
      .cloud-pill {
        padding: 6px 8px;
      }
      .icon-btn {
        width: 34px;
        height: 34px;
      }
      .avatar {
        width: 32px;
        height: 32px;
      }
    }
  `]
})
export class TopbarComponent {
  userService = inject(UserService);
  coachService = inject(CoachService);
  supabase = inject(SupabaseService);
  showAuthModal = signal<boolean>(false);
}

