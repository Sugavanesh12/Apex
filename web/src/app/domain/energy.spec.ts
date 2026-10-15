import { describe, expect, it } from 'vitest';
import { ACTIVITY_MULTIPLIER, ageFromDob, bmr, capWeeklyLoss, goalCalories, tdee } from './energy';

describe('energy', () => {
  it('UT-EN-01 BMR male', () => {
    expect(bmr({ weightKg: 80, heightCm: 180, ageYears: 30, sex: 'male' })).toBe(1780);
  });

  it('UT-EN-02 BMR female', () => {
    expect(bmr({ weightKg: 60, heightCm: 165, ageYears: 30, sex: 'female' })).toBeCloseTo(1320.25, 5);
  });

  it('UT-EN-03 sex unspecified uses the average of both formulas', () => {
    const input = { weightKg: 80, heightCm: 180, ageYears: 30 };
    const m = bmr({ ...input, sex: 'male' });
    const f = bmr({ ...input, sex: 'female' });
    expect(bmr({ ...input, sex: 'unspecified' })).toBeCloseTo((m + f) / 2, 5);
  });

  it('UT-EN-04 TDEE multipliers', () => {
    for (const [level, mult] of Object.entries(ACTIVITY_MULTIPLIER)) {
      expect(tdee(1780, level as keyof typeof ACTIVITY_MULTIPLIER)).toBeCloseTo(1780 * mult, 5);
    }
  });

  it('UT-EN-05 calorie floor clamps and flags adjusted', () => {
    const r = goalCalories(1400, 1300, 'lose', { deficitPct: 0.2 });
    expect(r.kcal).toBe(1300);
    expect(r.adjusted).toBe(true);
    const hard = goalCalories(1300, 1000, 'lose', { deficitPct: 0.2 });
    expect(hard.kcal).toBe(1200);
    expect(hard.adjusted).toBe(true);
  });

  it('goal calories: maintain and gain', () => {
    expect(goalCalories(2500, 1700, 'maintain')).toEqual({ kcal: 2500, adjusted: false, floor: 1700 });
    expect(goalCalories(2000, 1500, 'gain', { surplusPct: 0.1 }).kcal).toBe(2200);
  });

  it('UT-EN-06 weekly loss cap ~1% body weight', () => {
    expect(capWeeklyLoss(80, 1.5)).toEqual({ kgPerWeek: 0.8, capped: true, maxKgPerWeek: 0.8 });
    expect(capWeeklyLoss(80, 0.5).capped).toBe(false);
  });

  it('UT-EN-07 invalid inputs throw, never NaN', () => {
    expect(() => bmr({ weightKg: 80, heightCm: 0, ageYears: 30, sex: 'male' })).toThrow(RangeError);
    expect(() => bmr({ weightKg: 80, heightCm: 180, ageYears: 10, sex: 'male' })).toThrow(RangeError);
    expect(() => bmr({ weightKg: NaN, heightCm: 180, ageYears: 30, sex: 'male' })).toThrow(RangeError);
  });

  it('ageFromDob handles birthdays not yet reached', () => {
    expect(ageFromDob(new Date(1995, 11, 31), new Date(2026, 9, 15))).toBe(30);
    expect(ageFromDob(new Date(1995, 0, 1), new Date(2026, 9, 15))).toBe(31);
  });
});
