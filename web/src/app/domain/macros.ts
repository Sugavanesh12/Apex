/**
 * Macro, fiber and water targets (PRODUCT_PLAN §5.2).
 */
export interface MacroInput {
  kcal: number;
  weightKg: number;
  proteinGPerKg?: number;
  fatPct?: number;
}

export interface MacroTargets {
  proteinG: number;
  fatG: number;
  carbsG: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function macroTargets({ kcal, weightKg, proteinGPerKg = 2, fatPct = 0.25 }: MacroInput): MacroTargets {
  if (!(kcal > 0) || !(weightKg > 0)) throw new RangeError('kcal and weightKg must be positive');
  const proteinG = weightKg * proteinGPerKg;
  const fatG = Math.max((kcal * fatPct) / 9, 0.6 * weightKg);
  const carbsG = Math.max(0, (kcal - proteinG * 4 - fatG * 9) / 4);
  return { proteinG: round1(proteinG), fatG: round1(fatG), carbsG: round1(carbsG) };
}

export function macroKcal({ proteinG, fatG, carbsG }: MacroTargets): number {
  return proteinG * 4 + carbsG * 4 + fatG * 9;
}

export function fiberTargetG(kcal: number): number {
  return Math.round((14 * kcal) / 1000);
}

export interface WaterRange {
  minMl: number;
  maxMl: number;
}

export function waterTargetMl(weightKg: number): WaterRange {
  if (!(weightKg > 0)) throw new RangeError('weightKg must be positive');
  return { minMl: Math.round(weightKg * 30), maxMl: Math.round(weightKg * 35) };
}

export interface Nutrients {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Scales per-100 g nutrition values to a gram amount. Numbers come from the food DB, never from AI. */
export function nutrientsForGrams(per100: Nutrients, grams: number): Nutrients {
  const f = Math.max(0, grams) / 100;
  return {
    kcal: Math.round(per100.kcal * f),
    protein: round1(per100.protein * f),
    carbs: round1(per100.carbs * f),
    fat: round1(per100.fat * f),
  };
}

export function sumNutrients(items: Nutrients[]): Nutrients {
  const t = items.reduce(
    (a, n) => ({ kcal: a.kcal + n.kcal, protein: a.protein + n.protein, carbs: a.carbs + n.carbs, fat: a.fat + n.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  return { kcal: Math.round(t.kcal), protein: round1(t.protein), carbs: round1(t.carbs), fat: round1(t.fat) };
}
