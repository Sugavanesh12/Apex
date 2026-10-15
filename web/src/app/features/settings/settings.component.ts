import { Component, inject } from '@angular/core';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  template: `
    <div class="settings-page">
      <header class="settings-header">
        <h2>Settings & Preferences</h2>
        <p class="sub">Manage your profile, theme, units, and what APEX AI Coach knows about you.</p>
      </header>

      <div class="settings-sections">
        <!-- Appearance & Theme (Part E) -->
        <section class="card settings-card">
          <div class="card-head">
            <h3>Appearance & Theme</h3>
            <span class="badge badge-primary">Current: {{ user.profile().theme === 'dark' ? 'Performance (Dark)' : 'Nourish (Light)' }}</span>
          </div>

          <div class="theme-options">
            <button
              class="theme-btn"
              [class.active]="user.profile().theme === 'dark'"
              (click)="user.setTheme('dark')"
            >
              <div class="theme-swatch dark-swatch"></div>
              <div class="theme-text">
                <span class="theme-title">Performance (Dark)</span>
                <span class="theme-desc">Graphite, lime accents, high-contrast gym mode</span>
              </div>
            </button>

            <button
              class="theme-btn"
              [class.active]="user.profile().theme === 'light'"
              (click)="user.setTheme('light')"
            >
              <div class="theme-swatch light-swatch"></div>
              <div class="theme-text">
                <span class="theme-title">Nourish (Light)</span>
                <span class="theme-desc">Warm off-white, plum & mint tones</span>
              </div>
            </button>
          </div>
        </section>

        <!-- What your coach knows about you (Part A4) -->
        <section class="card settings-card">
          <div class="card-head">
            <h3>What Your Coach Knows About You</h3>
            <span class="badge badge-cyan">Privacy Protected</span>
          </div>
          <p class="section-desc">
            The User Brain context sent to AI models is limited to verifiable metrics. You can edit or purge this memory at any time.
          </p>

          <div class="memory-grid">
            <div class="memory-item">
              <span class="m-key">Primary Goal</span>
              <span class="m-val">{{ user.profile().goal }}</span>
            </div>
            <div class="memory-item">
              <span class="m-key">Experience</span>
              <span class="m-val">{{ user.profile().experience }}</span>
            </div>
            <div class="memory-item">
              <span class="m-key">Training Schedule</span>
              <span class="m-val">Mon / Wed / Fri · 45 min sessions</span>
            </div>
            <div class="memory-item">
              <span class="m-key">Diet Restrictions</span>
              <span class="m-val">None declared (Standard balanced)</span>
            </div>
          </div>

          <div class="memory-actions">
            <button class="btn btn-secondary" (click)="resetCoachMemory()">
              Reset Coach Memory
            </button>
          </div>
        </section>

        <!-- About & Legal -->
        <section class="card settings-card">
          <h3>Compliance & Disclaimers</h3>
          <p class="section-desc">
            APEX provides fitness, nutrition, and wellness guidance for athletic performance. It does not provide medical diagnosis or treatment.
          </p>
          <div class="legal-links">
            <span class="legal-link">Terms of Service</span> ·
            <span class="legal-link">Privacy Policy</span> ·
            <span class="legal-link">AI Processing Disclosures</span>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
    }
    .settings-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .sub {
      font-size: var(--fs-sm);
      color: var(--text-muted);
    }

    .settings-sections {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .settings-card {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .section-desc {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      line-height: 1.5;
    }

    .theme-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-3);
    }
    .theme-btn {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      padding: var(--s-3);
      border-radius: var(--r-input);
      border: 1px solid var(--border);
      background: var(--surface-2);
      cursor: pointer;
      text-align: left;
      transition: all var(--t-fast) var(--ease);
    }
    .theme-btn:hover {
      background: var(--surface-3);
      border-color: var(--border-strong);
    }
    .theme-btn.active {
      border-color: var(--primary);
      background: var(--surface-3);
      box-shadow: 0 0 12px -2px var(--primary-soft);
    }

    .theme-swatch {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
      border: 1px solid var(--border);
    }
    .dark-swatch {
      background: #0b1015;
      box-shadow: inset 0 0 0 4px #b8f23c;
    }
    .light-swatch {
      background: #faf6f1;
      box-shadow: inset 0 0 0 4px #5b2a4e;
    }

    .theme-text {
      display: flex;
      flex-direction: column;
    }
    .theme-title {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--text);
    }
    .theme-desc {
      font-size: 0.68rem;
      color: var(--text-faint);
    }

    .memory-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-3);
    }
    .memory-item {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-input);
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .m-key {
      font-size: 0.65rem;
      color: var(--text-faint);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .m-val {
      font-size: var(--fs-xs);
      font-weight: 600;
      color: var(--text);
    }

    .memory-actions {
      display: flex;
      justify-content: flex-start;
    }

    .legal-links {
      font-size: var(--fs-xs);
      color: var(--text-faint);
    }
    .legal-link {
      color: var(--text-muted);
      cursor: pointer;
    }
    .legal-link:hover {
      color: var(--primary);
      text-decoration: underline;
    }

    @media (max-width: 600px) {
      .theme-options, .memory-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SettingsComponent {
  user = inject(UserService);

  resetCoachMemory() {
    alert('Coach memory cleared. Personalized context will re-aggregate from your next 7 days of logs.');
  }
}
