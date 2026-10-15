/** Unit conversion (UT-UNIT-01). */
export const KG_PER_LB = 0.45359237;
export const CM_PER_IN = 2.54;

export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const lbToKg = (lb: number) => lb * KG_PER_LB;

export function cmToFtIn(cm: number): { ft: number; inches: number } {
  const totalIn = cm / CM_PER_IN;
  const ft = Math.floor(totalIn / 12);
  return { ft, inches: totalIn - ft * 12 };
}

export const ftInToCm = (ft: number, inches: number) => (ft * 12 + inches) * CM_PER_IN;
