import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="modal-backdrop" (click)="close()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="brand-row">
            <div class="brand-dot"></div>
            <span class="brand-title">APEX CLOUD AUTH</span>
          </div>
          <button class="close-btn" (click)="close()" title="Close">
            <app-icon name="close" [size]="18" />
          </button>
        </div>

        <!-- Mode Toggle Tabs -->
        <div class="mode-tabs">
          <button
            class="tab-btn"
            [class.active]="mode() === 'signin'"
            (click)="setMode('signin')"
          >
            Sign In
          </button>
          <button
            class="tab-btn"
            [class.active]="mode() === 'signup'"
            (click)="setMode('signup')"
          >
            Create Account
          </button>
        </div>

        <!-- Error & Success Notices -->
        @if (errorMessage()) {
          <div class="alert-box error-alert">
            <app-icon name="info" [size]="16" />
            <div class="alert-text-group">
              <span>{{ errorMessage() }}</span>
              @if (isEmailUnconfirmed()) {
                <div class="unconfirmed-guide">
                  <p class="guide-note">
                    <strong>Why did the link show 404?</strong> If you opened the email on your phone, <code>localhost:4205</code> points to your phone, not your computer!
                  </p>
                  <p class="guide-tip">
                    👉 <strong>Quick Fix:</strong> Open the confirmation email on <em>this computer</em>, or in your <strong>Supabase Dashboard</strong> go to <strong>Authentication &gt; Providers &gt; Email</strong> and turn off <strong>"Confirm email"</strong> for instant logins.
                  </p>
                  <button type="button" class="btn-resend" (click)="resendEmail()" [disabled]="resending()">
                    {{ resending() ? 'Resending...' : '📧 Resend Confirmation Email' }}
                  </button>
                </div>
              }
            </div>
          </div>
        }
        @if (successMessage()) {
          <div class="alert-box success-alert">
            <app-icon name="check" [size]="16" />
            <span>{{ successMessage() }}</span>
          </div>
        }

        <!-- Form Body -->
        <form (ngSubmit)="submit()" class="auth-form">
          @if (mode() === 'signup') {
            <div class="form-group">
              <label for="auth-name">Full Name or Handle</label>
              <input
                id="auth-name"
                type="text"
                [(ngModel)]="name"
                name="name"
                placeholder="e.g. Alex Hunter"
                required
              />
            </div>
          }

          <div class="form-group">
            <label for="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="athlete@apex.app"
              required
            />
          </div>

          <div class="form-group">
            <label for="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              minlength="6"
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary submit-btn"
            [disabled]="loading()"
          >
            @if (loading()) {
              <span class="spinner"></span>
              <span>Authenticating...</span>
            } @else {
              <span>{{ mode() === 'signin' ? 'Sign In to Supabase' : 'Create Supabase Account' }}</span>
            }
          </button>
        </form>

        <!-- Cloud Notice -->
        <div class="cloud-footer">
          <div class="cloud-indicator">
            <span class="status-dot"></span>
            <span>Connected to Supabase Project <code>drhlcligqarhbvkgnpbb</code></span>
          </div>
          <button class="guest-btn" (click)="close()">
            Continue in Guest Mode (Offline)
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      z-index: 1000;
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
      max-width: 440px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--s-4) var(--s-5);
      border-bottom: 1px solid var(--border);
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 8px var(--primary);
    }
    .brand-title {
      font-size: var(--fs-xs);
      font-weight: 800;
      letter-spacing: 0.1em;
      color: var(--text);
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: var(--r-input);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .close-btn:hover {
      color: var(--text);
    }

    .mode-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      padding: var(--s-3) var(--s-5) 0 var(--s-5);
      gap: var(--s-2);
    }
    .tab-btn {
      padding: 10px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-input);
      color: var(--text-muted);
      font-size: var(--fs-xs);
      font-weight: 700;
      cursor: pointer;
      transition: all var(--t-fast) var(--ease);
    }
    .tab-btn.active {
      background: var(--surface-3);
      border-color: var(--primary);
      color: var(--text);
    }

    .alert-box {
      margin: var(--s-3) var(--s-5) 0 var(--s-5);
      padding: 10px 12px;
      border-radius: var(--r-input);
      font-size: var(--fs-xs);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .error-alert {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #ef4444;
    }
    .success-alert {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.4);
      color: #22c55e;
    }

    .auth-form {
      padding: var(--s-4) var(--s-5);
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: var(--fs-xs);
      font-weight: 600;
      color: var(--text-muted);
    }
    .form-group input {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-input);
      padding: 10px 14px;
      color: var(--text);
      font-size: var(--fs-sm);
      outline: none;
      transition: border-color var(--t-fast) var(--ease);
    }
    .form-group input:focus {
      border-color: var(--primary);
    }

    .submit-btn {
      width: 100%;
      margin-top: var(--s-2);
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .cloud-footer {
      padding: var(--s-3) var(--s-5) var(--s-4) var(--s-5);
      background: var(--surface-2);
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      font-size: var(--fs-xs);
    }
    .cloud-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-faint);
      font-size: 0.7rem;
    }
    .cloud-indicator code {
      color: var(--primary);
      font-family: monospace;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 6px #22c55e;
    }
    .guest-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: var(--fs-xs);
      text-decoration: underline;
    }
    .guest-btn:hover {
      color: var(--text);
    }
    .alert-text-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }
    .unconfirmed-guide {
      margin-top: 4px;
      padding-top: 6px;
      border-top: 1px dashed rgba(239, 68, 68, 0.35);
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.72rem;
      color: #fca5a5;
    }
    .guide-note, .guide-tip {
      margin: 0;
      line-height: 1.4;
    }
    .guide-note code {
      background: rgba(0, 0, 0, 0.3);
      padding: 1px 4px;
      border-radius: 4px;
      color: #fff;
    }
    .btn-resend {
      align-self: flex-start;
      margin-top: 4px;
      padding: 4px 10px;
      border-radius: var(--r-pill);
      background: rgba(239, 68, 68, 0.25);
      border: 1px solid rgba(239, 68, 68, 0.6);
      color: #fff;
      font-size: 0.7rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-resend:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.45);
    }
    .btn-resend:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      .modal-dialog {
        max-width: calc(100vw - 24px);
        margin: 0 12px;
      }
      .modal-header, .auth-form, .cloud-footer {
        padding-left: var(--s-3);
        padding-right: var(--s-3);
      }
    }
  `]
})
export class AuthModalComponent {
  @Output() closed = new EventEmitter<void>();

  private supabase = inject(SupabaseService);

  mode = signal<'signin' | 'signup'>('signin');
  email = '';
  password = '';
  name = '';
  loading = signal<boolean>(false);
  resending = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  isEmailUnconfirmed = signal<boolean>(false);

  setMode(newMode: 'signin' | 'signup') {
    this.mode.set(newMode);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isEmailUnconfirmed.set(false);
  }

  close() {
    this.closed.emit();
  }

  async resendEmail() {
    if (!this.email) {
      this.errorMessage.set('Please enter your email address to resend confirmation.');
      return;
    }
    this.resending.set(true);
    try {
      await this.supabase.resendConfirmation(this.email);
      this.successMessage.set(`Confirmation email re-sent to ${this.email}! Please open it on your PC browser.`);
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Failed to resend confirmation email.');
    } finally {
      this.resending.set(false);
    }
  }

  async submit() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isEmailUnconfirmed.set(false);
    this.loading.set(true);

    try {
      if (this.mode() === 'signin') {
        await this.supabase.signIn(this.email, this.password);
        this.successMessage.set('Signed in successfully! Syncing live data...');
        setTimeout(() => this.close(), 900);
      } else {
        await this.supabase.signUp(this.email, this.password, this.name || 'Athlete');
        this.successMessage.set('Account created! Please check your email on this PC to confirm, or proceed to sign in.');
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please check credentials or network.';
      this.errorMessage.set(msg);
      if (msg.toLowerCase().includes('email not confirmed')) {
        this.isEmailUnconfirmed.set(true);
      }
    } finally {
      this.loading.set(false);
    }
  }
}
