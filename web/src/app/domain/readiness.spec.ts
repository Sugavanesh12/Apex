import { describe, expect, it } from 'vitest';
import { readiness } from './readiness';

describe('readiness', () => {
  it('UT-RD-01 all signals produce a 0–100 score with six factors', () => {
    const r = readiness({ sleepHours: 8, sleepQuality: 5, soreness: 0, energy: 10, stress: 1, loadRatio: 1, hrvDeltaPct: 10 });
    expect(r.score).toBe(100);
    expect(r.band).toBe('good');
    expect(r.recommendation).toBe('train');
    expect(r.signalsUsed).toBe(6);
  });

  it('UT-RD-02 missing signals re-normalize weights', () => {
    const r = readiness({ sleepHours: 8, soreness: 0, energy: 10, stress: 1 });
    expect(r.signalsUsed).toBe(4);
    expect(r.signalsTotal).toBe(6);
    expect(r.score).toBe(100);
  });

  it('UT-RD-03 bad sleep + high soreness → < 50, reduce/rest', () => {
    const r = readiness({ sleepHours: 4, soreness: 9 });
    expect(r.score).toBeLessThan(50);
    expect(['rest', 'mobility']).toContain(r.recommendation);
    expect(r.reason).toContain('Sleep');
  });

  it('moderate band suggests lightening', () => {
    const r = readiness({ sleepHours: 6.5, soreness: 4, energy: 6, stress: 5 });
    expect(r.band).toBe('moderate');
    expect(r.recommendation).toBe('lighten');
  });

  it('no signals → unknown, null score', () => {
    expect(readiness({})).toMatchObject({ score: null, band: 'unknown' });
  });

  it('score always clamped to 0–100', () => {
    const r = readiness({ hrvDeltaPct: 50, loadRatio: 3 });
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });
});
