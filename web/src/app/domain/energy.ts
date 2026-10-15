/**
 * Energy calculations (PRODUCT_PLAN §5.1). Pure TS, no framework imports.
 */
export type Sex = 'male' | 'female' | 'unspecified';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';
export type GoalDirection = 'lose' | 'maintain' | 'gain';

export const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

export const MIN_AGE = 13;
/** Absolute hard minimum for any calorie recommendation. */
export const ABSOLUTE_CALORIE_FLOOR = 1200;

export interface BmrInput {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: Sex;
}

function assertPositive(name: string, v: number): void {
  if (!Number.isFinite(v) || v <= 0) throw new RangeError(`${name} must be a positive number`);
}

/** Mifflin–St Jeor. "unspecified" uses the average of male and female formulas. */
export function bmr({ weightKg, heightCm, ageYears, sex }: BmrInput): number {
  assertPositive('weightKg', weightKg);
  assertPositive('heightCm', heightCm);
  if (!Number.isFinite(ageYears) || ageYears < MIN_AGE || ageYears > 120) {
    throw new RangeError(`ageYears must be between ${MIN_AGE} and 120`);
  }
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  const offset = sex === 'male' ? 5 : sex === 'female' ? -161 : (5 - 161) / 2;
  return base + offset;
}

export function tdee(bmrKcal: number, level: ActivityLevel): number {
  assertPositive('bmr', bmrKcal);
  return bmrKcal * ACTIVITY_MULTIPLIER[level];
}

export interface GoalCaloriesOptions {
  deficitPct?: number;
  surplusPct?: number;
  absoluteFloor?: number;
}

export interface GoalCalories {
  kcal: number;
  /** True when the floor clamped the result. */
  adjusted: boolean;
  floor: number;
}

/**
 * Goal calories with a safety floor tied to BMR plus an absolute hard minimum (§6.3).
 */
export function goalCalories(
  tdeeKcal: number,
  bmrKcal: number,
  goal: GoalDirection,
  { deficitPct = 0.15, surplusPct = 0.075, absoluteFloor = ABSOLUTE_CALORIE_FLOOR }: GoalCaloriesOptions = {},
): GoalCalories {
  const floor = Math.max(absoluteFloor, Math.round(bmrKcal));
  let kcal = tdeeKcal;
  if (goal === 'lose') kcal = tdeeKcal * (1 - deficitPct);
  if (goal === 'gain') kcal = tdeeKcal * (1 + surplusPct);
  kcal = Math.round(kcal);
  if (kcal < floor) return { kcal: floor, adjusted: true, floor };
  return { kcal, adjusted: false, floor };
}

export interface WeeklyRateCheck {
  kgPerWeek: number;
  capped: boolean;
  maxKgPerWeek: number;
}

/** Caps weekly weight-loss rate suggestions at ~1% body weight per week. */
export function capWeeklyLoss(weightKg: number, requestedKgPerWeek: number, maxPct = 0.01): WeeklyRateCheck {
  assertPositive('weightKg', weightKg);
  const maxKgPerWeek = +(weightKg * maxPct).toFixed(2);
  const requested = Math.abs(requestedKgPerWeek);
  if (requested > maxKgPerWeek) return { kgPerWeek: maxKgPerWeek, capped: true, maxKgPerWeek };
  return { kgPerWeek: requested, capped: false, maxKgPerWeek };
}

export function ageFromDob(dob: Date, today: Date = new Date()): number {
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}
