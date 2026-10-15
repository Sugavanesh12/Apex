import { describe, expect, it } from 'vitest';
import { fiberTargetG, macroKcal, macroTargets, nutrientsForGrams, sumNutrients, waterTargetMl } from './macros';

describe('macros', () => {
  it('UT-MC-01 macro split sums to total within ±1 kcal', () => {
    const m = macroTargets({ kcal: 2400, weightKg: 80, proteinGPerKg: 2 });
    expect(m.proteinG).toBe(160);
    expect(Math.abs(macroKcal(m) - 2400)).toBeLessThanOrEqual(1);
  });

  it('fat never below 0.6 g/kg', () => {
    const m = macroTargets({ kcal: 1500, weightKg: 100, fatPct: 0.2 });
    expect(m.fatG).toBeGreaterThanOrEqual(60);
  });

  it('UT-MC-02 water target 70 kg in 2.1–2.45 L', () => {
    expect(waterTargetMl(70)).toEqual({ minMl: 2100, maxMl: 2450 });
  });

  it('fiber ~14 g per 1000 kcal', () => {
    expect(fiberTargetG(2000)).toBe(28);
  });

  it('scales per-100 g values to grams and sums', () => {
    const chicken = { kcal: 165, protein: 31, carbs: 0, fat: 3.6 };
    const n = nutrientsForGrams(chicken, 150);
    expect(n).toEqual({ kcal: 248, protein: 46.5, carbs: 0, fat: 5.4 });
    expect(nutrientsForGrams(chicken, -5).kcal).toBe(0);
    expect(sumNutrients([n, n]).kcal).toBe(496);
  });
});
