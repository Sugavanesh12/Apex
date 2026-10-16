import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { CoachService } from '../../core/services/coach.service';
import { UserService } from '../../core/services/user.service';
import { GeminiService } from '../../core/services/gemini.service';

interface QuestionItem {
  category: 'workouts' | 'nutrition' | 'physiology' | 'adjustments';
  text: string;
}

@Component({
  selector: 'app-coach-page',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="coach-full-page">
      <!-- Header with Engine Status & Clear Chat -->
      <header class="coach-header">
        <div>
          <div class="title-row">
            <h2>APEX AI Copilot</h2>
            <button
              class="engine-chip"
              [class.engine-cloud]="gemini.isConfigured()"
              (click)="showApiKeyModal.set(true)"
              title="Click to configure Gemini API Key"
            >
              <app-icon [name]="gemini.isConfigured() ? 'zap' : 'robot'" [size]="14" />
              <span>{{ gemini.isConfigured() ? 'Gemini 2.5 Flash (Cloud)' : 'Sports Science Cognitive Engine' }}</span>
              <span class="engine-tag">{{ gemini.isConfigured() ? 'LIVE' : 'ACTIVE' }}</span>
            </button>
          </div>
          <p class="sub">Context-aware athletic intelligence grounded in your active logs, biomechanics, and recovery markers.</p>
        </div>

        <div class="header-actions">
          <button class="btn btn-ghost btn-sm clear-btn" (click)="coach.clearHistory()" title="Reset chat to fresh greeting">
            <app-icon name="trash" [size]="14" />
            <span>Clear Chat</span>
          </button>
          <div class="safety-chip">
            <app-icon name="info" [size]="14" />
            <span>Evidence-based coaching</span>
          </div>
        </div>
      </header>

      <!-- Main Chat Area -->
      <div class="chat-container card">
        <div class="messages-area">
          @for (msg of coach.messages(); track msg.id) {
            <div class="chat-bubble" [class.user-bubble]="msg.sender === 'user'" [class.ai-bubble]="msg.sender === 'ai'">
              <div class="bubble-sender">
                <div class="sender-info">
                  @if (msg.sender === 'ai') {
                    <div class="ai-avatar">
                      <app-icon name="robot" [size]="14" />
                    </div>
                  }
                  <span class="sender-name">{{ msg.sender === 'ai' ? 'APEX Coach' : user.profile().name }}</span>
                </div>
                <span class="sender-time">{{ msg.timestamp }}</span>
              </div>
              <p class="bubble-content">{{ msg.text }}</p>
            </div>
          }

          @if (coach.isThinking()) {
            <div class="chat-bubble ai-bubble thinking-bubble">
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
              <span class="thinking-text">Coach is evaluating biomechanics, metabolic demand & load...</span>
            </div>
          }
        </div>

        <!-- Dynamic Question Categories & Shuffle Bar -->
        <div class="question-explorer">
          <div class="category-tabs">
            <span class="tabs-label">Explore questions:</span>
            <button
              class="cat-tab"
              [class.active]="selectedCategory() === 'all'"
              (click)="setCategory('all')"
            >
              All Topics
            </button>
            <button
              class="cat-tab"
              [class.active]="selectedCategory() === 'workouts'"
              (click)="setCategory('workouts')"
            >
              🏋️ Workouts
            </button>
            <button
              class="cat-tab"
              [class.active]="selectedCategory() === 'nutrition'"
              (click)="setCategory('nutrition')"
            >
              🥗 Nutrition
            </button>
            <button
              class="cat-tab"
              [class.active]="selectedCategory() === 'physiology'"
              (click)="setCategory('physiology')"
            >
              🧬 Body Science
            </button>
            <button
              class="cat-tab"
              [class.active]="selectedCategory() === 'adjustments'"
              (click)="setCategory('adjustments')"
            >
              ⚡ Adjustments
            </button>
            <button class="shuffle-btn" (click)="shuffleQuestions()" title="Shuffle questions">
              <span>🎲 Shuffle</span>
            </button>
          </div>

          <div class="suggested-row">
            @for (s of visibleQuestions(); track s) {
              <button class="sugg-pill" (click)="selectPrompt(s)">
                {{ s }}
              </button>
            }
          </div>
        </div>

        <!-- Chat Input Bar -->
        <div class="chat-composer">
          <input
            type="text"
            [(ngModel)]="chatText"
            (keyup.enter)="sendChat()"
            placeholder="Ask anything about exercises, sets, nutrition, foods, soreness, hormones..."
          />
          <button class="btn btn-primary send-action-btn" (click)="sendChat()" [disabled]="!chatText.trim()">
            <span>Send Question</span>
            <app-icon name="chevron-right" [size]="16" />
          </button>
        </div>
      </div>

      <!-- Optional Gemini API Key Modal -->
      @if (showApiKeyModal()) {
        <div class="modal-backdrop" (click)="showApiKeyModal.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-row">
                <app-icon name="zap" [size]="18" />
                <h3>Google Gemini API Engine</h3>
              </div>
              <button class="btn-icon" (click)="showApiKeyModal.set(false)">
                <app-icon name="close" [size]="16" />
              </button>
            </div>
            <div class="modal-body">
              <p class="modal-desc">
                By default, APEX uses the comprehensive <strong>Sports Science Cognitive Engine</strong> which runs locally.
                Optionally enter your Google Gemini API key to route questions directly to <strong>Gemini 2.5 Flash</strong>.
              </p>
              <div class="form-group">
                <label>Gemini API Key</label>
                <input
                  type="password"
                  [(ngModel)]="keyInput"
                  placeholder="AIzaSy..."
                  class="api-input"
                />
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-ghost" (click)="clearApiKey()">Remove Key</button>
              <button class="btn btn-primary" (click)="saveApiKey()">Save & Connect</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .coach-full-page {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      height: calc(100vh - var(--topbar-h) - var(--s-5));
    }
    .coach-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-3);
      flex-wrap: wrap;
    }
    .title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .title-row h2 {
      margin: 0;
      font-size: var(--fs-xl);
      font-weight: 800;
    }
    .engine-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--r-pill);
      background: var(--surface-2);
      border: 1px solid var(--border);
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--t-fast);
    }
    .engine-chip:hover {
      border-color: var(--primary);
      color: var(--text);
    }
    .engine-cloud {
      background: var(--primary-soft);
      border-color: var(--primary-line);
      color: var(--primary);
    }
    .engine-tag {
      font-size: 0.6rem;
      padding: 1px 5px;
      border-radius: 4px;
      background: var(--surface-3);
      letter-spacing: 0.05em;
    }
    .engine-cloud .engine-tag {
      background: var(--primary);
      color: var(--on-primary);
    }
    .sub {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      margin-top: 2px;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .clear-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--fs-xs);
      color: var(--text-muted);
    }
    .clear-btn:hover {
      color: var(--accent-alert);
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
      min-height: 0;
    }
    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: var(--s-4) var(--s-5);
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }

    .chat-bubble {
      max-width: 82%;
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

    .bubble-sender {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-3);
    }
    .sender-info {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ai-avatar {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--primary-soft);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--primary-line);
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
      line-height: 1.6;
      color: var(--text);
      white-space: pre-line;
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

    .question-explorer {
      border-top: 1px solid var(--border);
      background: var(--surface);
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: var(--s-2) var(--s-4);
    }
    .category-tabs {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .tabs-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-faint);
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-right: 4px;
    }
    .cat-tab {
      font-size: 0.72rem;
      padding: 4px 10px;
      border-radius: var(--r-pill);
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--t-fast);
    }
    .cat-tab.active {
      background: var(--primary-soft);
      border-color: var(--primary);
      color: var(--primary);
      font-weight: 700;
    }
    .shuffle-btn {
      margin-left: auto;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: var(--r-pill);
      background: var(--surface-3);
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--t-fast);
    }
    .shuffle-btn:hover {
      border-color: var(--primary);
      color: var(--text);
    }

    .suggested-row {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: thin;
    }
    .sugg-pill {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      background: var(--surface-2);
      border: 1px solid var(--border);
      padding: 5px 14px;
      border-radius: var(--r-pill);
      white-space: nowrap;
      cursor: pointer;
      transition: all var(--t-fast);
    }
    .sugg-pill:hover {
      border-color: var(--primary);
      color: var(--text);
      background: var(--surface-3);
      transform: translateY(-1px);
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
    .send-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 var(--s-4);
    }

    /* Modal styles */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--s-4);
    }
    .modal-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-card);
      width: 100%;
      max-width: 480px;
      box-shadow: var(--shadow-2);
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      padding: var(--s-5);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--primary);
    }
    .modal-title-row h3 {
      margin: 0;
      font-size: var(--fs-base);
      color: var(--text);
    }
    .btn-icon {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
    }
    .modal-desc {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: var(--s-3);
    }
    .form-group label {
      display: block;
      font-size: var(--fs-xs);
      font-weight: 700;
      margin-bottom: 6px;
      color: var(--text);
    }
    .api-input {
      width: 100%;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-input);
      padding: 10px 14px;
      color: var(--text);
      font-size: var(--fs-sm);
      outline: none;
    }
    .api-input:focus {
      border-color: var(--primary);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--s-3);
    }
    @media (max-width: 768px) {
      .coach-full-page {
        height: calc(100dvh - var(--topbar-h) - var(--tabbar-h) - 16px);
        max-height: calc(100dvh - var(--topbar-h) - var(--tabbar-h) - 16px);
      }
      .coach-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--s-2);
      }
      .header-actions {
        width: 100%;
        justify-content: space-between;
      }
      .safety-chip {
        display: none;
      }
      .chat-container {
        flex: 1;
        min-height: 0;
      }
      .messages-area {
        padding: 12px;
        gap: 12px;
      }
      .chat-bubble {
        max-width: 94%;
        padding: 10px 12px;
      }
      .question-explorer {
        padding: 6px 10px;
      }
      .category-tabs {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .suggested-row {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .chat-composer {
        padding: 8px 10px;
        gap: 8px;
      }
      .chat-composer input {
        font-size: 14px;
        padding: 8px 14px;
      }
      .send-action-btn {
        padding: 0 12px;
      }
    }
  `]
})
export class CoachPageComponent {
  coach = inject(CoachService);
  user = inject(UserService);
  gemini = inject(GeminiService);

  chatText = '';
  showApiKeyModal = signal(false);
  keyInput = this.gemini.apiKey();

  selectedCategory = signal<'all' | 'workouts' | 'nutrition' | 'physiology' | 'adjustments'>('all');
  private shuffleSeed = signal<number>(0);

  readonly allQuestions: QuestionItem[] = [
    // Workouts
    { category: 'workouts', text: 'How do I fix my bench press arch to protect my shoulders?' },
    { category: 'workouts', text: 'How do I fix knee pinching in deep squats?' },
    { category: 'workouts', text: 'What is the best way to brace my core for heavy deadlifts?' },
    { category: 'workouts', text: 'How should I structure dynamic warm-ups for squats?' },
    { category: 'workouts', text: 'Explain progressive overload double progression method' },
    { category: 'workouts', text: 'How many sets per week for chest hypertrophy?' },
    { category: 'workouts', text: 'What is the optimal rest time between heavy compound sets?' },
    { category: 'workouts', text: 'How do I target the long head of my triceps?' },
    { category: 'workouts', text: 'How do I position my arms on lateral raises to isolate the side delts?' },
    { category: 'workouts', text: 'What is the difference between RPE 8 and training to failure?' },
    { category: 'workouts', text: 'How do I build a wider V-taper lat spread with pull-ups?' },
    { category: 'workouts', text: 'How should I position my feet on Bulgarian split squats to target glutes?' },

    // Nutrition
    { category: 'nutrition', text: 'What is the optimal protein intake per kg for hypertrophy?' },
    { category: 'nutrition', text: 'Should I take creatine before or after workouts?' },
    { category: 'nutrition', text: 'Why does scale weight fluctuate when starting a calorie deficit?' },
    { category: 'nutrition', text: 'What should I eat 60 minutes before a high-intensity workout?' },
    { category: 'nutrition', text: 'Is whole eggs and dietary cholesterol healthy for athletic hormones?' },
    { category: 'nutrition', text: 'How does intermittent fasting affect muscle protein synthesis?' },
    { category: 'nutrition', text: 'Can I eat a banana pre-workout for glycogen replenishment?' },
    { category: 'nutrition', text: 'What are the benefits of whey isolate vs whole food protein?' },
    { category: 'nutrition', text: 'How much water and sodium should I consume on heavy lifting days?' },
    { category: 'nutrition', text: 'How much of a calorie surplus should I maintain for a lean bulk?' },

    // Physiology & Body
    { category: 'physiology', text: 'Does severe muscle soreness (DOMS) mean more muscle growth?' },
    { category: 'physiology', text: 'Can I lift weights when I still have muscle soreness?' },
    { category: 'physiology', text: 'How does slow-wave deep sleep release growth hormone?' },
    { category: 'physiology', text: 'What does low heart rate variability (HRV) indicate about my nervous system?' },
    { category: 'physiology', text: 'How do dietary fats support testosterone production?' },
    { category: 'physiology', text: 'What is the molecular interference effect between cardio and lifting?' },
    { category: 'physiology', text: 'Why does stress and high cortisol cause water retention?' },
    { category: 'physiology', text: 'How do I fix clicking and impingement in my anterior shoulder?' },

    // Adjustments
    { category: 'adjustments', text: 'My readiness is low today, how should I adjust my workout volume?' },
    { category: 'adjustments', text: 'When should I take a proactive deload week?' },
    { category: 'adjustments', text: 'Should I do Zone 2 cardio on my rest days or post-workout?' },
    { category: 'adjustments', text: 'How do I break through a bench press plateau?' },
    { category: 'adjustments', text: 'How should I taper my training if I feel chronically fatigued?' }
  ];

  visibleQuestions = computed(() => {
    // depend on shuffleSeed to trigger recompute
    this.shuffleSeed();
    const cat = this.selectedCategory();
    const pool = cat === 'all' ? this.allQuestions : this.allQuestions.filter(q => q.category === cat);
    
    // Deterministic or randomized sample of 5 items
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5).map(q => q.text);
  });

  setCategory(cat: 'all' | 'workouts' | 'nutrition' | 'physiology' | 'adjustments') {
    this.selectedCategory.set(cat);
    this.shuffleQuestions();
  }

  shuffleQuestions() {
    this.shuffleSeed.update(v => v + 1);
  }

  selectPrompt(promptText: string) {
    this.chatText = promptText;
    this.sendChat();
  }

  sendChat() {
    if (!this.chatText.trim()) return;
    const t = this.chatText.trim();
    this.chatText = '';
    this.coach.askPrompt(t);
  }

  saveApiKey() {
    this.gemini.setApiKey(this.keyInput);
    this.showApiKeyModal.set(false);
  }

  clearApiKey() {
    this.keyInput = '';
    this.gemini.setApiKey('');
    this.showApiKeyModal.set(false);
  }
}
