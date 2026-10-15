/**
 * Readiness score 0–100 (PRODUCT_PLAN §5.4). Explainable heuristic, not a medical measure.
 * Missing signals re-normalize the remaining weights.
 */
export interface ReadinessInput {
  sleepHours?: number;
  /** 1–5 */
  sleepQuality?: number;
  /** 0 (none) – 10 (severe) */
  soreness?: number;
  /** 1–10 */
  energy?: number;
  /** 1 (calm) – 10 (very stressed) */
  stress?: number;
  /** this week's load ÷ 4-week average */
  loadRatio?: number;
  /** HRV change vs personal baseline, percent (e.g. +8) */
  hrvDeltaPct?: number;
}

export type ReadinessKey = 'sleep' | 'soreness' | 'energy' | 'stress' | 'load' | 'hrv';
export type ReadinessBand = 'good' | 'moderate' | 'low' | 'unknown';
export type Recommendation = 'train' | 'lighten' | 'mobility' | 'rest';

export interface ReadinessFactor {
  key: ReadinessKey;
  label: string;
  score: number;
  weight: number;
  note: string;
}

export interface Readiness {
  score: number | null;
  band: ReadinessBand;
  recommendation: Recommendation | null;
  signalsUsed: number;
  signalsTotal: number;
  factors: ReadinessFactor[];
  reason: string;
}

export const READINESS_WEIGHTS: Record<ReadinessKey, number> = {
  sleep: 0.3,
  soreness: 0.2,
  energy: 0.15,
  stress: 0.1,
  load: 0.15,
  hrv: 0.1,
};

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));
const has = (n: number | undefined): n is number => typeof n === 'number' && Number.isFinite(n);

function sleepScore(hours: number, quality?: number): number {
  const h = clamp(((hours - 4) / 4) * 100);
  return has(quality) ? 0.7 * h + 0.3 * clamp(((quality - 1) / 4) * 100) : h;
}

function loadScore(ratio: number): number {
  if (ratio <= 1) return 100;
  if (ratio <= 1.5) return 100 - ((ratio - 1) / 0.5) * 60;
  return clamp(40 - ((ratio - 1.5) / 0.5) * 40);
}

export function readiness(i: ReadinessInput): Readiness {
  const factors: ReadinessFactor[] = [];
  const add = (key: ReadinessKey, label: string, score: number, note: string) =>
    factors.push({ key, label, score: Math.round(clamp(score)), weight: READINESS_WEIGHTS[key], note });

  if (has(i.sleepHours)) add('sleep', 'Sleep', sleepScore(i.sleepHours, i.sleepQuality), `${i.sleepHours} h`);
  if (has(i.soreness)) add('soreness', 'Soreness', ((10 - i.soreness) / 10) * 100, `${i.soreness}/10`);
  if (has(i.energy)) add('energy', 'Energy', ((i.energy - 1) / 9) * 100, `${i.energy}/10`);
  if (has(i.stress)) add('stress', 'Stress', ((10 - i.stress) / 9) * 100, `${i.stress}/10`);
  if (has(i.loadRatio)) add('load', 'Training load', loadScore(i.loadRatio), `${i.loadRatio.toFixed(2)}× avg`);
  if (has(i.hrvDeltaPct)) add('hrv', 'HRV', 70 + i.hrvDeltaPct * 3, `${i.hrvDeltaPct > 0 ? '+' : ''}${i.hrvDeltaPct}%`);

  const signalsTotal = Object.keys(READINESS_WEIGHTS).length;
  if (factors.length === 0) {
    return {
      score: null,
      band: 'unknown',
      recommendation: null,
      signalsUsed: 0,
      signalsTotal,
      factors,
      reason: 'Complete a check-in to see your readiness.',
    };
  }

  const wSum = factors.reduce((a, f) => a + f.weight, 0);
  const score = Math.round(factors.reduce((a, f) => a + f.score * f.weight, 0) / wSum);
  const band: ReadinessBand = score >= 75 ? 'good' : score >= 50 ? 'moderate' : 'low';
  const recommendation: Recommendation =
    band === 'good' ? 'train' : band === 'moderate' ? 'lighten' : score < 35 ? 'rest' : 'mobility';
  const weakest = [...factors].sort((a, b) => a.score - b.score)[0];
  const reason =
    band === 'good'
      ? 'Your signals look solid. Train as planned.'
      : `${weakest.label} is pulling your score down (${weakest.note}).`;

  return { score, band, recommendation, signalsUsed: factors.length, signalsTotal, factors, reason };
}

export const RECOMMENDATION_LABEL: Record<Recommendation, string> = {
  train: 'Train as planned',
  lighten: 'Lighten today',
  mobility: 'Mobility day',
  rest: 'Rest and recover',
};
