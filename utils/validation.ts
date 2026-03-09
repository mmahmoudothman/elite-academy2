export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email.trim()) return { valid: false, error: 'Email is required' };
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return { valid: false, error: 'Invalid email format' };
  return { valid: true };
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone.trim()) return { valid: false, error: 'Phone is required' };
  const re = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
  if (!re.test(phone.trim())) return { valid: false, error: 'Invalid phone format' };
  return { valid: true };
}

export function validateRequired(value: string, fieldName: string): { valid: boolean; error?: string } {
  if (!value.trim()) return { valid: false, error: `${fieldName} is required` };
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < 6) return { valid: false, error: 'Password must be at least 6 characters' };
  return { valid: true };
}
