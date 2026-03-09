// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Strip HTML tags completely
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

// Sanitize object values recursively
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string') {
      (result as any)[key] = stripHtml(result[key]);
    } else if (typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
      (result as any)[key] = sanitizeObject(result[key]);
    }
  }
  return result;
}
