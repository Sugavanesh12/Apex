import { Injectable, inject, signal } from '@angular/core';
import { GeminiService, AthleticContext } from './gemini.service';
import { UserService } from './user.service';
import { NutritionService } from './nutrition.service';
import { RecoveryService } from './recovery.service';
import { WorkoutService } from './workout.service';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const CHAT_STORAGE_KEY = 'apex_coach_chat_history_v2';

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private gemini = inject(GeminiService);
  private user = inject(UserService);
  private nutrition = inject(NutritionService);
  private recovery = inject(RecoveryService);
  private workout = inject(WorkoutService);

  readonly isCopilotOpen = signal(false);
  readonly isThinking = signal(false);

  readonly messages = signal<ChatMessage[]>(this.loadInitialMessages());

  private loadInitialMessages(): ChatMessage[] {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Strip any legacy proposals from chat history
            return parsed.map((m: any) => {
              const { proposal, ...clean } = m;
              return clean as ChatMessage;
            });
          }
        } catch (e) {
          console.warn('Failed to parse saved coach chat:', e);
        }
      }
    }
    return [this.createWelcomeMessage()];
  }

  private createWelcomeMessage(): ChatMessage {
    const profile = this.user.profile();
    const readiness = this.recovery.readinessResult();
    const name = profile.name || 'Athlete';
    const score = readiness.score ?? 85;
    const level = readiness.band === 'good' ? 'Optimal' : (readiness.band === 'moderate' ? 'Moderate' : 'Restorative');

    return {
      id: `msg-welcome-${Date.now()}`,
      sender: 'ai',
      text: `Hello ${name}! I'm your APEX Performance & Sports Science AI Coach. Your readiness today is ${score}/100 (${level}). Ask me anything about workout techniques, muscle anatomy, nutrition science, food choices, recovery, or custom plan adjustments.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  private saveMessages(msgs: ChatMessage[]) {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs));
      } catch (e) {
        console.warn('Failed to save coach chat to storage:', e);
      }
    }
  }

  clearHistory() {
    const fresh = [this.createWelcomeMessage()];
    this.messages.set(fresh);
    this.saveMessages(fresh);
  }

  toggleCopilot() {
    this.isCopilotOpen.update(v => !v);
  }

  openCopilot() {
    this.isCopilotOpen.set(true);
  }

  closeCopilot() {
    this.isCopilotOpen.set(false);
  }

  async askPrompt(promptText: string) {
    if (!promptText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.messages.update(msgs => {
      const updated = [...msgs, userMsg];
      this.saveMessages(updated);
      return updated;
    });

    this.isThinking.set(true);

    const profile = this.user.profile();
    const readiness = this.recovery.readinessResult();

    const context: AthleticContext = {
      userName: profile.name,
      goal: profile.goal,
      experience: profile.experience,
      readinessScore: readiness.score ?? 85,
      readinessReason: readiness.reason,
      caloriesConsumed: this.nutrition.caloriesConsumed(),
      caloriesTarget: this.nutrition.caloriesTarget(),
      proteinConsumed: this.nutrition.proteinConsumed(),
      proteinTarget: this.nutrition.proteinTarget(),
      workoutTitle: this.workout.liveSession().sessionTitle
    };

    try {
      const response = await this.gemini.chatWithCoach(promptText, context);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      this.messages.update(msgs => {
        const updated = [...msgs, aiMsg];
        this.saveMessages(updated);
        return updated;
      });
    } finally {
      this.isThinking.set(false);
    }
  }
}


