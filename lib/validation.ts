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

export function tripError(input: {
  fromCountry: string; toCountry: string; departDate: string; arriveDate: string;
  luggageCapacityKg?: string | number | null;
}): string | null {
  if (!input.fromCountry?.trim() || !input.toCountry?.trim()) return "Please enter both countries.";
  if (input.fromCountry.trim().toLowerCase() === input.toCountry.trim().toLowerCase())
    return "From and to countries must be different.";
  const depart = new Date(input.departDate);
  const arrive = new Date(input.arriveDate);
  if (isNaN(depart.getTime()) || isNaN(arrive.getTime())) return "Please enter valid dates.";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (depart < today) return "Departure date can't be in the past.";
  if (arrive < depart) return "Arrival must be on or after departure.";
  if (input.luggageCapacityKg != null && input.luggageCapacityKg !== "") {
    const kg = Number(input.luggageCapacityKg);
    if (isNaN(kg) || kg <= 0) return "Luggage capacity must be greater than 0.";
  }
  return null;
}

export function requestError(input: {
  title: string; originCountry: string; destinationCountry: string;
  productPrice: number; travelerReward: number; localPrice?: number | null; currency: string;
}): string | null {
  if (!input.title?.trim()) return "Please enter a title.";
  if (!input.originCountry?.trim() || !input.destinationCountry?.trim()) return "Please enter both countries.";
  if (input.originCountry.trim().toLowerCase() === input.destinationCountry.trim().toLowerCase())
    return "Origin and destination must be different.";
  if (!(input.productPrice > 0)) return "Product price must be greater than 0.";
  if (!(input.travelerReward >= 0)) return "Traveler reward can't be negative.";
  if (input.localPrice != null && !(input.localPrice > 0)) return "Local price must be greater than 0.";
  if (!/^[A-Za-z]{3}$/.test(input.currency?.trim() ?? "")) return "Currency must be a 3-letter code.";
  return null;
}
