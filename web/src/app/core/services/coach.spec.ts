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

  it('answers specialized sports science queries with high scientific fidelity', async () => {
    // 1. Biomechanics test
    const benchRes = await gemini.chatWithCoach('how do i fix bench press shoulder pain and elbow flaring', mockContext);
    expect(benchRes.text.toLowerCase()).toMatch(/scapula|subacromial|elbow/i);

    // 2. Nutrition leucine threshold test
    const leucineRes = await gemini.chatWithCoach('what is the leucine threshold to trigger muscle protein synthesis', mockContext);
    expect(leucineRes.text.toLowerCase()).toMatch(/mtorc1|mTOR|leucine/i);

    // 3. Indian athletic nutrition test
    const indianRes = await gemini.chatWithCoach('how to optimize an indian vegetarian diet with soya chunks and paneer', mockContext);
    expect(indianRes.text.toLowerCase()).toMatch(/soya|paneer|protein/i);

    // 4. Biometrics HRV test
    const hrvRes = await gemini.chatWithCoach('what does low heart rate variability HRV tell me about my central nervous system', mockContext);
    expect(hrvRes.text.toLowerCase()).toMatch(/sympathetic|parasympathetic|autonomic/i);
  });

  it('accurately calculates custom sports meals for expanded athletic foods', () => {
    const tofuMeal = gemini.calculateCustomDish('sesame tofu edamame power bowl');
    expect(tofuMeal.dishName).toContain('Tofu');
    expect(tofuMeal.ingredients.length).toBeGreaterThanOrEqual(3);

    const soyaMeal = gemini.calculateCustomDish('high protein soya chunks curry');
    expect(soyaMeal.dishName).toContain('Soya');
    expect(soyaMeal.ingredients.some(i => i.name.toLowerCase().includes('soya'))).toBe(true);

    const yogurtMeal = gemini.calculateCustomDish('greek yogurt berry parfait');
    expect(yogurtMeal.dishName).toContain('Greek Yogurt');
    expect(yogurtMeal.ingredients.some(i => i.name.toLowerCase().includes('greek yogurt'))).toBe(true);
  });

  it('responds naturally and warmly to greetings without unsolicited technical lectures', async () => {
    const hiRes = await gemini.chatWithCoach('Hi', mockContext);
    expect(hiRes.text).not.toContain('Regarding "Hi"');
    expect(hiRes.text.toLowerCase()).toMatch(/hey|ready|welcome|dial in/i);
    expect(hiRes.text).toContain(mockContext.workoutTitle);

    const thanksRes = await gemini.chatWithCoach('Thanks coach!', mockContext);
    expect(thanksRes.text).not.toContain('Regarding');
    expect(thanksRes.text.toLowerCase()).toMatch(/you've got this|recovery|consistent/i);
  });
});
