import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { UserService } from '../../core/services/user.service';
import { CoachService } from '../../core/services/coach.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { NotificationService, ApexNotification } from '../../core/services/notification.service';
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

        <!-- Notification Bell & Popover Trigger -->
        <div class="notification-wrap">
          <button
            class="icon-btn"
            [class.active]="notifService.isNotificationOpen()"
            (click)="notifService.toggleOpen()"
            title="Notifications"
            aria-label="Notifications"
          >
            <app-icon name="bell" [size]="20" />
            @if (notifService.unreadCount() > 0) {
              <span class="notification-badge-num">{{ notifService.unreadCount() }}</span>
            }
          </button>

          <!-- Notification Dropdown Popover -->
          @if (notifService.isNotificationOpen()) {
            <div class="notifications-backdrop" (click)="notifService.close()"></div>
            <div class="notifications-dropdown card animated-slide-down" (click)="$event.stopPropagation()">
              <div class="notif-header">
                <div class="notif-title-row">
                  <app-icon name="bell" [size]="16" />
                  <h4>Notifications</h4>
                  @if (notifService.unreadCount() > 0) {
                    <span class="unread-pill">{{ notifService.unreadCount() }} New</span>
                  }
                </div>
                <div class="notif-actions-top">
                  @if (notifService.unreadCount() > 0) {
                    <button class="notif-text-btn" (click)="notifService.markAllAsRead()">
                      Mark all read
                    </button>
                  }
                  <button class="notif-text-btn danger" (click)="notifService.clearAll()">
                    Clear
                  </button>
                  <button class="notif-close-btn" (click)="notifService.close()">✕</button>
                </div>
              </div>

              <!-- Push Alerts Device Bar -->
              <div class="push-optin-strip">
                <div class="strip-left">
                  <span class="push-title">🔔 Browser Push Alerts</span>
                  <span class="sub-strip">Get live workout rest and nutrition reminders</span>
                </div>
                <button class="btn btn-secondary btn-sm enable-push-btn" (click)="enableDevicePush()">
                  Enable
                </button>
              </div>

              <!-- Notification Items List -->
              <div class="notif-list">
                @if (notifService.notifications().length === 0) {
                  <div class="notif-empty">
                    <span class="empty-icon">📭</span>
                    <p>All caught up! No active notifications.</p>
                  </div>
                } @else {
                  @for (item of notifService.notifications(); track item.id) {
                    <div
                      class="notif-item"
                      [class.unread]="!item.read"
                      (click)="handleNotificationClick(item)"
                    >
                      <div class="notif-icon-col">
                        <span class="notif-emoji">{{ item.icon }}</span>
                        @if (!item.read) {
                          <span class="unread-dot"></span>
                        }
                      </div>
                      <div class="notif-content-col">
                        <div class="notif-top">
                          <span class="item-title">{{ item.title }}</span>
                          <span class="item-time">{{ item.timestamp }}</span>
                        </div>
                        <p class="item-msg">{{ item.message }}</p>
                        @if (item.link) {
                          <span class="item-link">Tap to open →</span>
                        }
                      </div>
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>

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
    .notification-wrap {
      position: relative;
    }
    .icon-btn.active {
      border-color: var(--primary);
      color: var(--primary);
      background: var(--surface-2);
    }
    .notification-badge-num {
      position: absolute;
      top: -3px;
      right: -3px;
      min-width: 18px;
      height: 18px;
      background: #ef4444;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 800;
      border-radius: var(--r-pill);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      border: 2px solid var(--bg);
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
    }

    .notifications-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: transparent;
    }

    .notifications-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: min(390px, 92vw);
      max-height: 480px;
      background: rgba(11, 16, 21, 0.98);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-strong);
      border-radius: var(--r-card);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
      z-index: 1001;
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
      animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .notif-header {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      background: var(--surface-2);
    }
    .notif-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text);
    }
    .notif-title-row h4 {
      font-size: 0.92rem;
      font-weight: 800;
      margin: 0;
    }
    .unread-pill {
      font-size: 0.62rem;
      font-weight: 800;
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.4);
      padding: 1px 6px;
      border-radius: var(--r-pill);
    }
    .notif-actions-top {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .notif-text-btn {
      background: none;
      border: none;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--primary);
      cursor: pointer;
      padding: 2px 4px;
    }
    .notif-text-btn:hover {
      text-decoration: underline;
    }
    .notif-text-btn.danger {
      color: var(--text-muted);
    }
    .notif-text-btn.danger:hover {
      color: #f87171;
    }
    .notif-close-btn {
      background: none;
      border: none;
      font-size: 0.9rem;
      color: var(--text-muted);
      cursor: pointer;
      padding: 2px 4px;
    }

    .push-optin-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 14px;
      background: rgba(56, 189, 248, 0.08);
      border-bottom: 1px solid rgba(56, 189, 248, 0.18);
    }
    .strip-left {
      display: flex;
      flex-direction: column;
    }
    .push-title {
      font-size: 0.74rem;
      font-weight: 700;
      color: #38bdf8;
    }
    .sub-strip {
      font-size: 0.65rem;
      color: var(--text-muted);
    }
    .enable-push-btn {
      padding: 3px 10px;
      font-size: 0.7rem;
      min-height: 28px;
    }

    .notif-list {
      flex: 1;
      overflow-y: auto;
      max-height: 360px;
      display: flex;
      flex-direction: column;
    }
    .notif-empty {
      padding: 36px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .empty-icon {
      font-size: 2rem;
    }

    .notif-item {
      display: flex;
      gap: 12px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      transition: background var(--t-fast);
      position: relative;
    }
    .notif-item:hover {
      background: var(--surface-2);
    }
    .notif-item.unread {
      background: rgba(34, 197, 94, 0.04);
    }
    .notif-icon-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .notif-emoji {
      font-size: 1.3rem;
      line-height: 1;
    }
    .unread-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 6px var(--primary);
    }
    .notif-content-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
    }
    .notif-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .item-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: #fff;
    }
    .item-time {
      font-size: 0.65rem;
      color: var(--text-faint);
      white-space: nowrap;
    }
    .item-msg {
      font-size: 0.74rem;
      color: var(--text-muted);
      line-height: 1.4;
      margin: 2px 0;
    }
    .item-link {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--primary);
      margin-top: 2px;
    }

    @keyframes slideDown {
      from { transform: translateY(-8px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
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
  notifService = inject(NotificationService);
  private router = inject(Router);

  showAuthModal = signal<boolean>(false);

  handleNotificationClick(item: ApexNotification) {
    this.notifService.markAsRead(item.id);
    this.notifService.close();
    if (item.link) {
      this.router.navigateByUrl(item.link);
    }
  }

  async enableDevicePush() {
    const granted = await this.notifService.requestBrowserPush();
    if (granted) {
      alert('Browser notifications enabled! You will now receive live alerts for workouts, rest timers, and macros.');
    } else {
      alert('Browser push notifications require your browser permission. Please check your browser address bar settings.');
    }
  }
}

