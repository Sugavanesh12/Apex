import { describe, expect, it } from 'vitest';
import { GeminiService, AthleticContext } from './gemini.service';

describe('Coach & Gemini Sports Science Service', () => {
  const gemini = new GeminiService();

  const mockContext: AthleticContext = {
    userName: 'Athlete',
    goal: 'Hypertrophy',
    experience: 'Intermediate',
    readinessScore: 88,
    readinessReason: 'Optimal HRV & Sleep',
    caloriesConsumed: 1400,
    caloriesTarget: 2400,
    proteinConsumed: 28,
    proteinTarget: 160,
    workoutTitle: 'Upper Push & Pull'
  };

  it('provides distinct, specific responses for different athlete questions', async () => {
    const q1 = 'what can i take protein food as a snack';
    const q2 = 'how can we increase the weight while we do exercises';

    const res1 = await gemini.chatWithCoach(q1, mockContext);
    const res2 = await gemini.chatWithCoach(q2, mockContext);

    // Verify responses are completely distinct
    expect(res1.text).not.toBe(res2.text);

    // Verify q1 addresses protein snacks
    expect(res1.text.toLowerCase()).toContain('snack');
    expect(res1.text).toMatch(/Greek Yogurt|Cottage Cheese|Eggs|Edamame|Whey/i);

    // Verify q2 addresses progressive overload & increasing weight
    expect(res2.text.toLowerCase()).toMatch(/double progression|weight|load|reps in reserve/i);
    expect(res2.text).not.toContain('Greek Yogurt');
  });

  it('never returns proposal or action cards in chat responses', async () => {
    const questions = [
      'what can i take protein food as a snack',
      'how can we increase the weight while we do exercises',
      'how many sets per week for chest',
      'what is the optimal protein target per kg'
    ];

    for (const q of questions) {
      const res = await gemini.chatWithCoach(q, mockContext);
      expect((res as any).proposal).toBeUndefined();
    }
  });
});
