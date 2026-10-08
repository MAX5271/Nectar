import { describe, it, expect } from 'vitest';
import { cn } from '../../src/lib/cn';

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, '', 'b')).toBe('a b');
  });

  it('resolves conflicting Tailwind utilities in favor of the later one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('supports conditional object syntax', () => {
    expect(cn({ 'text-ink': true, 'text-tomato': false })).toBe('text-ink');
  });
});
