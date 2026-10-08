import { describe, it, expect } from 'vitest';
import { macroShare, buildRingSegments, MACRO_ORDER } from '../../src/lib/macros';

describe('macroShare', () => {
  it('returns the percentage of total calories a macro contributes', () => {
    // 50g protein * 4 kcal/g = 200 kcal, of a 2000 kcal day = 10%
    expect(macroShare(50, 4, 2000)).toBe(10);
  });

  it('rounds to the nearest whole percent', () => {
    expect(macroShare(33, 4, 1000)).toBe(13); // 132/1000 = 13.2%
  });

  it('caps at 100 even if the math overshoots', () => {
    expect(macroShare(500, 9, 1000)).toBe(100);
  });

  it('returns 0 when total calories is missing or zero', () => {
    expect(macroShare(50, 4, 0)).toBe(0);
    expect(macroShare(50, 4, undefined)).toBe(0);
  });
});

describe('buildRingSegments', () => {
  it('returns one segment per macro, in the fixed protein/carbs/fat order', () => {
    const segments = buildRingSegments({ protein: 150, carbs: 200, fat: 60 }, 2000);
    expect(segments.map((s) => s.key)).toEqual(MACRO_ORDER);
  });

  it('chains offsets so each segment starts where the previous one ended', () => {
    const segments = buildRingSegments({ protein: 150, carbs: 200, fat: 60 }, 2000);
    expect(segments[0]!.offset).toBe(0);
    expect(segments[1]!.offset).toBeCloseTo(segments[0]!.offset + segments[0]!.share);
    expect(segments[2]!.offset).toBeCloseTo(segments[1]!.offset + segments[1]!.share);
  });

  it('produces shares that are fractions of the ring (0-1), not percentages', () => {
    const segments = buildRingSegments({ protein: 150, carbs: 200, fat: 60 }, 2000);
    for (const segment of segments) {
      expect(segment.share).toBeGreaterThanOrEqual(0);
      expect(segment.share).toBeLessThanOrEqual(1);
    }
  });

  it('returns all-zero shares when total calories is 0', () => {
    const segments = buildRingSegments({ protein: 150, carbs: 200, fat: 60 }, 0);
    expect(segments.every((s) => s.share === 0)).toBe(true);
  });
});
