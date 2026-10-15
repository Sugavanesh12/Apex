import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { CoachService } from '../../core/services/coach.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-coach-page',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="coach-full-page">
      <header class="coach-header">
        <div>
          <h2>APEX AI Copilot</h2>
          <p class="sub">Context-aware coaching grounded in your active logs and recovery markers.</p>
        </div>
        <div class="safety-chip">
          <app-icon name="info" [size]="14" />
          <span>Not medical advice. AI guidance supports your training.</span>
        </div>
      </header>

      <div class="chat-container card">
        <div class="messages-area">
          @for (msg of coach.messages(); track msg.id) {
            <div class="chat-bubble" [class.user-bubble]="msg.sender === 'user'" [class.ai-bubble]="msg.sender === 'ai'">
              <div class="bubble-sender">
                <span class="sender-name">{{ msg.sender === 'ai' ? 'APEX Coach' : user.profile().name }}</span>
                <span class="sender-time">{{ msg.timestamp }}</span>
              </div>
              <p class="bubble-content">{{ msg.text }}</p>

              @if (msg.proposal) {
                <div class="action-card">
                  <div class="action-title">Proposed Action</div>
                  <p class="action-desc">{{ msg.proposal.actionText }}</p>
                  @if (msg.proposal.applied) {
                    <span class="badge badge-primary">✓ Applied to your plan</span>
                  } @else {
                    <div class="action-btns">
                      <button class="btn btn-primary" (click)="coach.confirmProposal(msg.id)">
                        Confirm & Apply
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          }

          @if (coach.isThinking()) {
            <div class="chat-bubble ai-bubble thinking-bubble">
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
              <span class="thinking-text">Coach is analyzing your recovery and load...</span>
            </div>
          }
        </div>

        <div class="suggested-row">
          <span class="sugg-lbl">Quick questions:</span>
          @for (s of quickSuggestions; track s) {
            <button class="sugg-pill" (click)="coach.askPrompt(s)">{{ s }}</button>
          }
        </div>

        <div class="chat-composer">
          <input
            type="text"
            [(ngModel)]="chatText"
            (keyup.enter)="sendChat()"
            placeholder="Ask about your workout, nutrition, recovery or plan adjustments..."
          />
          <button class="btn btn-primary send-action-btn" (click)="sendChat()" [disabled]="!chatText.trim()">
            Send Prompt
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .coach-full-page {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      height: calc(100vh - var(--topbar-h) - var(--s-7));
    }
    .coach-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-3);
      flex-wrap: wrap;
    }
    .sub {
      font-size: var(--fs-xs);
      color: var(--text-muted);
    }
    .safety-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--r-pill);
      background: var(--surface-2);
      border: 1px solid var(--border);
      font-size: var(--fs-xs);
      color: var(--text-faint);
    }

    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
    }
    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: var(--s-5);
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }

    .chat-bubble {
      max-width: 80%;
      padding: var(--s-4);
      border-radius: var(--r-card);
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: var(--fs-sm);
    }
    .ai-bubble {
      background: var(--surface-2);
      border: 1px solid var(--border);
      align-self: flex-start;
    }
    .user-bubble {
      background: var(--primary-soft);
      border: 1px solid var(--primary-line);
      align-self: flex-end;
    }

    .thinking-bubble {
      display: flex;
      flex-direction: row;
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

    .bubble-sender {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-3);
    }
    .sender-name {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--primary);
    }
    .user-bubble .sender-name {
      color: var(--text);
    }
    .sender-time {
      font-size: 0.65rem;
      color: var(--text-faint);
    }
    .bubble-content {
      line-height: 1.5;
      color: var(--text);
    }

    .action-card {
      margin-top: var(--s-3);
      padding: var(--s-3);
      background: var(--surface-3);
      border-radius: var(--r-input);
      border: 1px solid var(--border-strong);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .action-title {
      font-size: var(--fs-xs);
      font-weight: 700;
      color: var(--accent-1);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .action-desc {
      font-size: var(--fs-xs);
      color: var(--text);
    }
    .action-btns {
      display: flex;
      margin-top: 4px;
    }

    .suggested-row {
      padding: var(--s-2) var(--s-4);
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      border-top: 1px solid var(--border);
      background: var(--surface);
    }
    .sugg-lbl {
      font-size: var(--fs-xs);
      color: var(--text-faint);
      white-space: nowrap;
    }
    .sugg-pill {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      background: var(--surface-2);
      border: 1px solid var(--border);
      padding: 4px 12px;
      border-radius: var(--r-pill);
      white-space: nowrap;
      cursor: pointer;
    }
    .sugg-pill:hover {
      border-color: var(--primary);
      color: var(--text);
    }

    .chat-composer {
      padding: var(--s-3) var(--s-4);
      border-top: 1px solid var(--border);
      display: flex;
      gap: var(--s-3);
      background: var(--surface);
    }
    .chat-composer input {
      flex: 1;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      padding: 10px 18px;
      color: var(--text);
      font-size: var(--fs-sm);
      outline: none;
    }
    .chat-composer input:focus {
      border-color: var(--primary);
    }
  `]
})
export class CoachPageComponent {
  coach = inject(CoachService);
  user = inject(UserService);

  chatText = '';
  quickSuggestions = [
    'How do I fix my bench press arch to protect my shoulders?',
    'What is the optimal protein intake per kg for hypertrophy?',
    'Why does scale weight fluctuate when starting a calorie deficit?',
    'How should I structure dynamic warm-ups for squats?',
    'Explain progressive overload double progression method'
  ];

  sendChat() {
    if (!this.chatText.trim()) return;
    const t = this.chatText;
    this.chatText = '';
    this.coach.askPrompt(t);
  }
}
