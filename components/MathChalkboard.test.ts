import { describe, expect, it } from 'vitest';
import { evaluateMath } from './MathChalkboard';

describe('evaluateMath', () => {
  it('respects multiplication precedence and records calculation steps', () => {
    const result = evaluateMath('2 + 3 * 4');
    expect(result?.result).toBe('14');
    expect(result?.steps.some(step => step.includes('3 × 4 = 12'))).toBe(true);
  });

  it('evaluates scientific functions and powers', () => {
    expect(evaluateMath('sqrt(81) + 4^2')?.result).toBe('25');
  });

  it('checks numeric equality locally', () => {
    expect(evaluateMath('2 + 2 = 4')?.result).toContain('True');
    expect(evaluateMath('2 + 2 = 5')?.result).toContain('False');
  });

  it('solves supported simple linear equations', () => {
    expect(evaluateMath('2x + 5 = 13')?.result).toBe('x = 4');
  });

  it('returns no solution for incomplete or unsafe arithmetic', () => {
    expect(evaluateMath('2 +')).toBeNull();
    expect(evaluateMath('4 / 0')).toBeNull();
    expect(evaluateMath('x^2 = 9')).toBeNull();
  });
});
