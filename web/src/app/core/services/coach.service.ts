import { Injectable, signal } from '@angular/core';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  proposal?: {
    actionText: string;
    applied: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  readonly isCopilotOpen = signal(false);

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
        applied: false
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

  askPrompt(promptText: string) {
    this.messages.update(msgs => [
      ...msgs,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: promptText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    // Deterministic rule-grounded response
    setTimeout(() => {
      let reply = "I've reviewed your current stats.";
      let proposalText: string | undefined;

      if (promptText.includes('tired') || promptText.includes('adjust')) {
        reply = "Understood. Your recovery score is 86, but if your systemic fatigue feels elevated, it's smarter to prevent overreach.";
        proposalText = "Reduce working sets from 4 to 3 on Back Squat and skip the final accessory exercise.";
      } else if (promptText.includes('readiness')) {
        reply = "Your readiness of 86 is driven by 7h 32m of sleep (score 88) and HRV at 82 ms. Your fatigue load is balanced at 78.";
      } else if (promptText.includes('eat')) {
        reply = "You currently have 580 kcal and 48g of protein remaining today. A grilled chicken bowl or Greek yogurt bowl with seeds will hit your targets cleanly.";
      } else {
        reply = `Analyzing ${promptText} against your last 14 days of logs. Your progressive overload trajectory is right on schedule.`;
      }

      this.messages.update(msgs => [
        ...msgs,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          proposal: proposalText ? { actionText: proposalText, applied: false } : undefined
        }
      ]);
    }, 400);
  }

  confirmProposal(messageId: string) {
    this.messages.update(msgs =>
      msgs.map(m => {
        if (m.id === messageId && m.proposal) {
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
