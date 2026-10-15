import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { CoachService } from '../../core/services/coach.service';

@Component({
  selector: 'app-copilot-panel',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <aside class="copilot-panel" [class.open]="coachService.isCopilotOpen()" aria-label="AI Coach Panel">
      <!-- Panel Header -->
      <div class="panel-header">
        <div class="header-left">
          <div class="avatar-ring">
            <app-icon name="robot" [size]="20" />
          </div>
          <div>
            <div class="panel-title">APEX COPILOT</div>
            <div class="panel-subtitle">
              <span class="status-dot"></span>
              Online · Your AI coach
            </div>
          </div>
        </div>
        <button class="close-btn" (click)="coachService.closeCopilot()" aria-label="Close Copilot">
          <app-icon name="close" [size]="18" />
        </button>
      </div>

      <!-- Messages & Prompts Content -->
      <div class="panel-body">
        @for (msg of coachService.messages(); track msg.id) {
          <div class="msg-bubble" [class.msg-user]="msg.sender === 'user'" [class.msg-ai]="msg.sender === 'ai'">
            <p>{{ msg.text }}</p>
            @if (msg.proposal) {
              <div class="proposal-card">
                <p class="proposal-text">{{ msg.proposal.actionText }}</p>
                @if (msg.proposal.applied) {
                  <div class="applied-chip">
                    <app-icon name="check" [size]="14" />
                    <span>Adjustment Applied</span>
                  </div>
                } @else {
                  <div class="proposal-actions">
                    <button class="btn btn-ghost" (click)="coachService.confirmProposal(msg.id)">Dismiss</button>
                    <button class="btn btn-primary" (click)="coachService.confirmProposal(msg.id)">
                      Confirm & Apply
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }

        @if (coachService.isThinking()) {
          <div class="msg-bubble msg-ai thinking-bubble">
            <div class="typing-dots">
              <span></span><span></span><span></span>
            </div>
            <span class="thinking-text">Coach is analyzing your recovery and load...</span>
          </div>
        }

        <!-- Quick Prompts Section (as shown in reference screenshot) -->
        <div class="prompt-section">
          <div class="prompt-heading">Try asking:</div>
          <div class="prompt-chips">
            @for (prompt of suggestedPrompts; track prompt) {
              <button class="prompt-chip" (click)="coachService.askPrompt(prompt)">
                {{ prompt }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Footer Disclaimer & Input -->
      <div class="panel-footer">
        <div class="disclaimer">
          <app-icon name="info" [size]="12" />
          <span>I'll only make changes with your confirmation.</span>
        </div>
        <div class="input-box">
          <input
            type="text"
            [(ngModel)]="inputText"
            (keyup.enter)="sendMessage()"
            placeholder="Ask your coach anything..."
          />
          <button class="send-btn" (click)="sendMessage()" [disabled]="!inputText.trim()">
            <app-icon name="chevron-right" [size]="16" />
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: contents;
    }
    .copilot-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: clamp(320px, 28vw, 380px);
      background: var(--surface);
      border-left: 1px solid var(--border);
      box-shadow: var(--shadow-2);
      z-index: 100;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform var(--t-med) var(--ease);
    }
    .copilot-panel.open {
      transform: translateX(0);
    }

    .panel-header {
      padding: var(--s-4);
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: var(--s-3);
    }
    .avatar-ring {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1.5px solid var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-soft);
    }
    .panel-title {
      font-family: var(--font-display);
      font-size: var(--fs-sm);
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--text);
    }
    .panel-subtitle {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 6px var(--primary);
    }
    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: var(--text-muted);
      cursor: pointer;
    }
    .close-btn:hover {
      color: var(--text);
      background: var(--surface-2);
    }

    .panel-body {
      flex: 1;
      padding: var(--s-4);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }

    .msg-bubble {
      padding: var(--s-3) var(--s-4);
      border-radius: var(--r-card);
      font-size: var(--fs-sm);
      line-height: 1.45;
    }
    .msg-ai {
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text);
    }
    .msg-user {
      background: var(--primary-soft);
      border: 1px solid var(--primary-line);
      color: var(--text);
      align-self: flex-end;
    }

    .thinking-bubble {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .typing-dots {
      display: flex;
      gap: 4px;
    }
    .typing-dots span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--primary);
      animation: dotPulse 1.2s infinite ease-in-out;
    }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dotPulse {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1.1); opacity: 1; }
    }
    .thinking-text {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      font-style: italic;
    }

    .proposal-card {
      margin-top: var(--s-3);
      padding: var(--s-3);
      background: var(--surface-3);
      border: 1px solid var(--border-strong);
      border-radius: var(--r-input);
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .proposal-text {
      font-size: var(--fs-xs);
      color: var(--text);
      line-height: 1.4;
    }
    .proposal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--s-2);
      margin-top: 4px;
    }
    .proposal-actions button {
      min-height: 34px;
      font-size: 0.75rem;
      padding: 6px 14px;
    }
    .applied-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--fs-xs);
      color: var(--primary);
      font-weight: 600;
    }

    .prompt-section {
      margin-top: var(--s-4);
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .prompt-heading {
      font-size: var(--fs-xs);
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .prompt-chips {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .prompt-chip {
      text-align: left;
      padding: 8px 12px;
      border-radius: var(--r-input);
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      font-size: var(--fs-xs);
      cursor: pointer;
      transition: all var(--t-fast) var(--ease);
    }
    .prompt-chip:hover {
      color: var(--text);
      border-color: var(--primary);
      background: var(--surface-3);
    }

    .panel-footer {
      padding: var(--s-3) var(--s-4) var(--s-4);
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .disclaimer {
      font-size: 0.65rem;
      color: var(--text-faint);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .input-box {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 6px 6px 6px 14px;
    }
    .input-box input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: var(--text);
      font-size: var(--fs-xs);
    }
    .send-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary);
      color: var(--on-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .send-btn:disabled {
      opacity: 0.4;
      cursor: default;
    }
  `]
})
export class CopilotPanelComponent {
  coachService = inject(CoachService);
  inputText = '';

  suggestedPrompts = [
    'Plan my week around a 10K race',
    'What should I eat today?',
    'How’s my recovery looking?',
    'Adjust today’s workout (I’m tired)',
    'Explain my readiness score'
  ];

  sendMessage() {
    if (!this.inputText.trim()) return;
    const text = this.inputText.trim();
    this.inputText = '';
    this.coachService.askPrompt(text);
  }
}
