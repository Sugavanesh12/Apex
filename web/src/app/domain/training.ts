/**
 * Training calculations (PRODUCT_PLAN §5.3): 1RM, volume, load, overload, PR detection.
 */
export interface SetPerf {
  weightKg: number;
  reps: number;
  rpe?: number;
}

export interface OneRepMax {
  value: number;
  /** Epley is unreliable above 10 reps; such values are not used for PRs. */
  lowConfidence: boolean;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function epley1rm(weightKg: number, reps: number): OneRepMax {
  if (!(weightKg >= 0) || !(reps >= 1)) throw new RangeError('weight must be >= 0 and reps >= 1');
  const value = reps === 1 ? weightKg : weightKg * (1 + reps / 30);
  return { value: round1(value), lowConfidence: reps > 10 };
}

export function volume(sets: SetPerf[]): number {
  return sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
}

export function sessionLoad(sessionRpe: number, minutes: number): number {
  if (sessionRpe < 1 || sessionRpe > 10) throw new RangeError('session RPE must be 1–10');
  return sessionRpe * Math.max(0, minutes);
}

export type LoadFlag = 'none' | 'caution' | 'high';

export interface LoadSpike {
  ratio: number;
  flag: LoadFlag;
}

/** Compares this week's load to the 4-week average. Heuristic guidance only. */
export function loadSpike(weekLoad: number, previousWeeks: number[]): LoadSpike {
  const prev = previousWeeks.filter((n) => n > 0);
  if (prev.length === 0) return { ratio: 1, flag: 'none' };
  const avg = prev.reduce((a, b) => a + b, 0) / prev.length;
  const ratio = Math.round((weekLoad / avg) * 100) / 100;
  const flag: LoadFlag = ratio >= 1.5 ? 'high' : ratio >= 1.3 ? 'caution' : 'none';
  return { ratio, flag };
}

export interface OverloadInput {
  sets: SetPerf[];
  repRange: [number, number];
  incrementKg: number;
}

export interface OverloadSuggestion {
  action: 'increase' | 'keep' | 'reduce';
  weightKg: number;
  reason: string;
}

/**
 * All working sets at the top of the range with RPE <= 8 → add the smallest increment.
 * Missed reps never increase load.
 */
export function suggestOverload({ sets, repRange: [min, max], incrementKg }: OverloadInput): OverloadSuggestion {
  if (sets.length === 0) return { action: 'keep', weightKg: 0, reason: 'No sets logged yet.' };
  const top = Math.max(...sets.map((s) => s.weightKg));
  const working = sets.filter((s) => s.weightKg === top);
  const allTop = working.every((s) => s.reps >= max && (s.rpe ?? 8) <= 8);
  if (allTop) {
    return {
      action: 'increase',
      weightKg: top + incrementKg,
      reason: `All sets hit ${max} reps at RPE 8 or lower. Add ${incrementKg} kg.`,
    };
  }
  const missed = working.filter((s) => s.reps < min).length;
  if (missed > working.length / 2) {
    return {
      action: 'reduce',
      weightKg: Math.max(0, top - incrementKg),
      reason: `Most sets fell below ${min} reps. Drop ${incrementKg} kg and rebuild.`,
    };
  }
  return { action: 'keep', weightKg: top, reason: `Stay at ${top} kg until every set reaches ${max} reps.` };
}

export interface PrResult {
  isPr: boolean;
  kind: 'weight' | 'e1rm' | null;
  e1rm: number;
}

/**
 * PR when the weight beats the best weight previously lifted for at least as many reps,
 * or the estimated 1RM (reps <= 10) beats the best previous estimate. Ties are not PRs.
 * With no history there is nothing to beat, so no PR badge.
 */
export function detectPr(set: SetPerf, history: SetPerf[]): PrResult {
  const est = epley1rm(set.weightKg, set.reps);
  if (history.length === 0) return { isPr: false, kind: null, e1rm: est.value };
  const sameOrMoreReps = history.filter((h) => h.reps >= set.reps);
  const bestWeight = sameOrMoreReps.length ? Math.max(...sameOrMoreReps.map((h) => h.weightKg)) : -Infinity;
  if (set.weightKg > bestWeight && sameOrMoreReps.length) return { isPr: true, kind: 'weight', e1rm: est.value };
  if (!est.lowConfidence) {
    const bestE1rm = Math.max(
      ...history.filter((h) => h.reps <= 10).map((h) => epley1rm(h.weightKg, h.reps).value),
      -Infinity,
    );
    if (est.value > bestE1rm) return { isPr: true, kind: 'e1rm', e1rm: est.value };
  }
  return { isPr: false, kind: null, e1rm: est.value };
}
