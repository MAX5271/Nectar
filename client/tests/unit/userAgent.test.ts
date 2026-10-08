import { describe, it, expect } from 'vitest';
import { parseUserAgent } from '../../src/lib/userAgent';

describe('parseUserAgent', () => {
  it('returns "Unknown device" for a missing user agent', () => {
    expect(parseUserAgent(undefined)).toBe('Unknown device');
    expect(parseUserAgent(null)).toBe('Unknown device');
    expect(parseUserAgent('')).toBe('Unknown device');
  });

  it('identifies Chrome on Windows', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    expect(parseUserAgent(ua)).toBe('Chrome on Windows');
  });

  it('identifies Safari on macOS (and does not mistake it for Chrome)', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
    expect(parseUserAgent(ua)).toBe('Safari on macOS');
  });

  it('identifies Edge (not Chrome, despite sharing the Chrome token)', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
    expect(parseUserAgent(ua)).toBe('Edge on Windows');
  });

  it('identifies Safari on iOS', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
    expect(parseUserAgent(ua)).toBe('Safari on iOS');
  });

  it('falls back to just the browser name when the OS is unrecognized', () => {
    expect(parseUserAgent('SomeCustomClient Chrome/1.0')).toBe('Chrome');
  });
});
