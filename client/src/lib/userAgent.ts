/** Turns a raw User-Agent string into a short "Browser on OS" label, for the sessions list. No parsing library — just enough to be readable, not exhaustive. */
export function parseUserAgent(ua?: string | null): string {
  if (!ua) return 'Unknown device';

  let browser = 'Unknown browser';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  let os = '';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/iphone|ipad|ios/i.test(ua)) os = 'iOS';
  else if (/mac os/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';

  return os ? `${browser} on ${os}` : browser;
}
