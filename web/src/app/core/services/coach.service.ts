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
  proposal?: {
    actionText: string;
    applied: boolean;
    type?: 'training' | 'nutrition' | 'recovery';
  };
}

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

  readonly messages = signal<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: 'I can help you plan, adjust, or answer anything about your training, nutrition, recovery, or progress.',
      timestamp: '09:00 AM'
    },
    {
      id: 'msg-proposal',
      sender: 'ai',
      text: 'Here is an actionable recommendation based on your recent load data:',
      timestamp: '09:02 AM',
      proposal: {
        actionText: 'Apply a small adjustment to today’s session based on your lower recovery: Replace the accessory work with a shorter core block.',
        applied: false,
        type: 'training'
      }
    }
  ]);

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

    this.messages.update(msgs => [
      ...msgs,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: promptText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

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

      this.messages.update(msgs => [
        ...msgs,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          proposal: response.proposal ? {
            actionText: response.proposal.actionText,
            applied: false,
            type: response.proposal.type
          } : undefined
        }
      ]);
    } finally {
      this.isThinking.set(false);
    }
  }

  confirmProposal(messageId: string) {
    this.messages.update(msgs =>
      msgs.map(m => {
        if (m.id === messageId && m.proposal) {
          // If proposal was nutrition, we can simulate logging or adjustment
          if (m.proposal.type === 'nutrition') {
            this.nutrition.proteinConsumed.update(p => p + 25);
            this.nutrition.caloriesConsumed.update(c => c + 150);
          }
          return {
            ...m,
            proposal: { ...m.proposal, applied: true }
          };
        }
        return m;
      })
    );
  }
}

