import { describe, expect, it } from 'vitest';
import { detectPr, epley1rm, loadSpike, sessionLoad, suggestOverload, volume } from './training';

describe('training', () => {
  it('UT-1RM-01 Epley 100 × 5 = 116.7', () => {
    expect(epley1rm(100, 5)).toEqual({ value: 116.7, lowConfidence: false });
  });

  it('UT-1RM-02 reps > 10 flagged low confidence', () => {
    expect(epley1rm(100, 15).lowConfidence).toBe(true);
  });

  it('volume sums weight × reps', () => {
    expect(volume([{ weightKg: 100, reps: 5 }, { weightKg: 80, reps: 8 }])).toBe(1140);
  });

  it('UT-LD-01 session load RPE 7 × 60 min = 420', () => {
    expect(sessionLoad(7, 60)).toBe(420);
  });

  it('UT-LD-02 load spike ≥ 1.5× flags high; < 1.3× no flag', () => {
    expect(loadSpike(1500, [1000, 1000, 1000, 1000]).flag).toBe('high');
    expect(loadSpike(1290, [1000, 1000, 1000, 1000]).flag).toBe('none');
    expect(loadSpike(1350, [1000, 1000, 1000, 1000]).flag).toBe('caution');
    expect(loadSpike(500, []).flag).toBe('none');
  });

  it('UT-OV-01 all sets top reps at RPE ≤ 8 → +smallest increment', () => {
    const s = suggestOverload({
      sets: [
        { weightKg: 60, reps: 8, rpe: 7 },
        { weightKg: 60, reps: 8, rpe: 8 },
      ],
      repRange: [6, 8],
      incrementKg: 2.5,
    });
    expect(s.action).toBe('increase');
    expect(s.weightKg).toBe(62.5);
  });

  it('UT-OV-02 missed reps never increase', () => {
    const reduce = suggestOverload({
      sets: [
        { weightKg: 60, reps: 4 },
        { weightKg: 60, reps: 5 },
        { weightKg: 60, reps: 7 },
      ],
      repRange: [6, 8],
      incrementKg: 2.5,
    });
    expect(reduce.action).toBe('reduce');
    expect(reduce.weightKg).toBe(57.5);
    const keep = suggestOverload({
      sets: [
        { weightKg: 60, reps: 8, rpe: 9 },
        { weightKg: 60, reps: 7 },
      ],
      repRange: [6, 8],
      incrementKg: 2.5,
    });
    expect(keep.action).toBe('keep');
    expect(keep.weightKg).toBe(60);
  });

  it('UT-PR-01 new weight at same reps is PR; ties are not', () => {
    const history = [{ weightKg: 120, reps: 5 }];
    expect(detectPr({ weightKg: 125, reps: 5 }, history)).toMatchObject({ isPr: true, kind: 'weight' });
    expect(detectPr({ weightKg: 120, reps: 5 }, history).isPr).toBe(false);
  });

  it('estimated 1RM PR when reps increase at the same weight', () => {
    expect(detectPr({ weightKg: 120, reps: 7 }, [{ weightKg: 120, reps: 5 }])).toMatchObject({ isPr: true, kind: 'e1rm' });
  });

  it('no history means no PR badge', () => {
    expect(detectPr({ weightKg: 100, reps: 5 }, []).isPr).toBe(false);
  });
});
