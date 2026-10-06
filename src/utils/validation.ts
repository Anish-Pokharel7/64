export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^9[0-9]{8,9}$/.test(phone.replace(/[\s-]/g, ''));
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 6;
}
