const attempts: Record<string, number[]> = {};

export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  if (!attempts[key]) attempts[key] = [];
  attempts[key] = attempts[key].filter(t => now - t < windowMs);
  if (attempts[key].length >= maxAttempts) return false;
  attempts[key].push(now);
  return true;
}

export function getRemainingCooldown(key: string, windowMs: number): number {
  if (!attempts[key] || attempts[key].length === 0) return 0;
  const oldest = attempts[key][0];
  const elapsed = Date.now() - oldest;
  return Math.max(0, windowMs - elapsed);
}
