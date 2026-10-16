import { Component, inject, signal, computed } from '@angular/core';
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
        <div class="header-actions">
          <button class="action-icon-btn" (click)="coachService.clearHistory()" title="Clear Chat History">
            <app-icon name="trash" [size]="15" />
          </button>
          <button class="close-btn" (click)="coachService.closeCopilot()" aria-label="Close Copilot">
            <app-icon name="close" [size]="18" />
          </button>
        </div>
      </div>

      <!-- Messages & Prompts Content -->
      <div class="panel-body">
        @for (msg of coachService.messages(); track msg.id) {
          <div class="msg-bubble" [class.msg-user]="msg.sender === 'user'" [class.msg-ai]="msg.sender === 'ai'">
            <p>{{ msg.text }}</p>
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

        <!-- Quick Prompts Section with Dynamic Shuffle -->
        <div class="prompt-section">
          <div class="prompt-header-row">
            <span class="prompt-heading">Try asking:</span>
            <button class="shuffle-sm-btn" (click)="shufflePrompts()" title="Shuffle questions">
              <app-icon name="refresh" [size]="12" />
              <span>Shuffle</span>
            </button>
          </div>
          <div class="prompt-chips">
            @for (prompt of visiblePrompts(); track prompt) {
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
            placeholder="Ask about workouts, food, recovery..."
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
      width: clamp(320px, 28vw, 400px);
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
    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .action-icon-btn {
      width: 30px;
      height: 30px;
      border-radius: var(--r-pill);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--t-fast);
    }
    .action-icon-btn:hover {
      color: var(--accent-alert);
      border-color: var(--accent-alert);
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
      background: var(--accent-1);
    }
    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      background: none;
      border: none;
      cursor: pointer;
    }
    .close-btn:hover {
      background: var(--surface-2);
      color: var(--text);
    }

    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--s-4);
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }

    .msg-bubble {
      padding: 10px 14px;
      border-radius: var(--r-card);
      font-size: var(--fs-xs);
      line-height: 1.5;
      max-width: 88%;
      white-space: pre-line;
    }
    .msg-bubble p {
      margin: 0;
    }
    .msg-user {
      align-self: flex-end;
      background: var(--primary-soft);
      border: 1px solid var(--primary-line);
      color: var(--text);
    }
    .msg-ai {
      align-self: flex-start;
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text);
    }

    .thinking-bubble {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .typing-dots {
      display: flex;
      gap: 3px;
    }
    .typing-dots span {
      width: 5px;
      height: 5px;
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
      font-size: 0.7rem;
      color: var(--text-muted);
      font-style: italic;
    }

    .prompt-section {
      margin-top: var(--s-3);
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .prompt-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .prompt-heading {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .shuffle-sm-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.68rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--r-pill);
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--t-fast);
    }
    .shuffle-sm-btn:hover {
      color: var(--primary);
      border-color: var(--primary);
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
      font-size: 0.75rem;
      cursor: pointer;
      transition: all var(--t-fast) var(--ease);
      line-height: 1.35;
    }
    .prompt-chip:hover {
      color: var(--text);
      border-color: var(--primary);
      background: var(--surface-3);
      transform: translateX(2px);
    }

    .panel-footer {
      padding: var(--s-3) var(--s-4);
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
      background: var(--surface);
    }
    .disclaimer {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.65rem;
      color: var(--text-faint);
    }
    .input-box {
      display: flex;
      align-items: center;
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
      border: none;
      transition: all var(--t-fast);
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

  private shuffleIndex = signal<number>(0);

  readonly promptPool = [
    'How do I fix knee pinching in deep squats?',
    'How much protein do I need per kg for muscle growth?',
    'Should I take creatine before or after workouts?',
    'Why is my scale weight fluctuating today?',
    'How many sets per week for chest hypertrophy?',
    'How does sleep affect my recovery and readiness?',
    'How do I fix my bench press arch to protect my shoulders?',
    'How do I target the long head of my triceps?',
    'Can I eat a banana pre-workout for glycogen replenishment?',
    'What should I eat 60 minutes before a high-intensity workout?',
    'Does severe muscle soreness (DOMS) mean more muscle growth?',
    'My readiness is low today, how should I adjust my workout volume?',
    'What is the optimal rest time between heavy compound sets?',
    'How do I build a wider V-taper lat spread with pull-ups?',
    'How do dietary fats support testosterone production?'
  ];

  visiblePrompts = computed(() => {
    const idx = this.shuffleIndex();
    const count = 4;
    const start = (idx * count) % this.promptPool.length;
    const selected: string[] = [];
    for (let i = 0; i < count; i++) {
      selected.push(this.promptPool[(start + i) % this.promptPool.length]);
    }
    return selected;
  });

  shufflePrompts() {
    this.shuffleIndex.update(v => v + 1);
  }

  sendMessage() {
    if (!this.inputText.trim()) return;
    const text = this.inputText.trim();
    this.inputText = '';
    this.coachService.askPrompt(text);
  }
}
