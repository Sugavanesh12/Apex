import { describe, expect, it } from 'vitest';
import { cmToFtIn, ftInToCm, kgToLb, lbToKg } from './units';

describe('units', () => {
  it('UT-UNIT-01 kg↔lb round-trip within 0.01', () => {
    for (const kg of [0.5, 20, 72.5, 180, 500]) {
      expect(Math.abs(lbToKg(kgToLb(kg)) - kg)).toBeLessThan(0.01);
    }
    expect(kgToLb(100)).toBeCloseTo(220.46, 2);
  });

  it('UT-UNIT-01 cm↔ft/in round-trip within 0.01', () => {
    for (const cm of [150, 175.3, 201]) {
      const { ft, inches } = cmToFtIn(cm);
      expect(Math.abs(ftInToCm(ft, inches) - cm)).toBeLessThan(0.01);
    }
    expect(cmToFtIn(182.88).ft).toBe(6);
  });
});
