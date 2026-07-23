export function isValidEmail(s: string): boolean {
  return /^\S+@\S+\.\S+$/.test(s.trim());
}

export function passwordError(s: string): string | null {
  if (s.length < 8) return "Password must be at least 8 characters.";
  return null;
}

const ROLES = ["BUYER", "TRAVELER", "BOTH"];

export function signupError(input: {
  fullName: string; email: string; password: string; role: string;
}): string | null {
  if (!input.fullName.trim()) return "Please enter your name.";
  if (!isValidEmail(input.email)) return "Please enter a valid email.";
  const pw = passwordError(input.password);
  if (pw) return pw;
  if (!ROLES.includes(input.role)) return "Please choose a valid role.";
  return null;
}
