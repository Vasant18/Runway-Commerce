// Per-airline accent theming for marketplace ticket cards.
// Color accents only (no logos/marks) — brand-inspired hues keyed by the
// airline name stored on Trip.airline. Unknown/missing airlines fall back
// to the house amber so every ticket stays on-palette.

export type AirlineTheme = {
  accent: string;    // primary accent (top bar, plane glyph, route)
  accentInk: string; // text color that reads on top of `badge`
  badge: string;     // airline chip background
};

const AMBER_FALLBACK: AirlineTheme = { accent: "#F9A600", accentInk: "#192227", badge: "#FFC655" };

const THEMES: Record<string, AirlineTheme> = {
  "emirates":           { accent: "#D71920", accentInk: "#FDFCFC", badge: "#C9A24B" },
  "qatar airways":      { accent: "#5C0632", accentInk: "#FDFCFC", badge: "#8A6079" },
  "air india":          { accent: "#D9532B", accentInk: "#FDFCFC", badge: "#E98A48" },
  "united":             { accent: "#0033A0", accentInk: "#FDFCFC", badge: "#3B6FD4" },
  "british airways":    { accent: "#1E3A5F", accentInk: "#FDFCFC", badge: "#B42846" },
  "latam":              { accent: "#1B0088", accentInk: "#FDFCFC", badge: "#ED1650" },
  "singapore airlines": { accent: "#1D3F6E", accentInk: "#FDFCFC", badge: "#C9A24B" },
  "lufthansa":          { accent: "#05164D", accentInk: "#192227", badge: "#F9BA00" },
  "air france":         { accent: "#002157", accentInk: "#FDFCFC", badge: "#CE0C25" },
  "japan airlines":     { accent: "#B01E2F", accentInk: "#FDFCFC", badge: "#D96A75" },
  "korean air":         { accent: "#00A9E0", accentInk: "#192227", badge: "#7CCDEB" },
  "qantas":             { accent: "#E40000", accentInk: "#FDFCFC", badge: "#EE6B6B" },
  "air canada":         { accent: "#D22630", accentInk: "#FDFCFC", badge: "#E4757C" },
  "klm":                { accent: "#00A1DE", accentInk: "#192227", badge: "#79C9EA" },
  "ana":                { accent: "#003E7E", accentInk: "#FDFCFC", badge: "#4C7FB4" },
  "vistara":            { accent: "#4B2A75", accentInk: "#FDFCFC", badge: "#B8A44C" },
  "cathay pacific":     { accent: "#006564", accentInk: "#FDFCFC", badge: "#4C9C9B" },
};

export function airlineTheme(name?: string | null): AirlineTheme {
  if (!name) return AMBER_FALLBACK;
  return THEMES[name.trim().toLowerCase()] ?? AMBER_FALLBACK;
}

// Inline style payload for a ticket root: exposes the theme as CSS custom props.
export function airlineThemeVars(name?: string | null): Record<string, string> {
  const t = airlineTheme(name);
  return { "--tk-accent": t.accent, "--tk-accent-ink": t.accentInk, "--tk-badge": t.badge };
}
