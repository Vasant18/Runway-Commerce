// Compact star rating used on ticket cards. Renders "—" when unrated so the
// dashboard (which doesn't fetch ratings) can reuse the same cards safely.
export default function StarRating({ avg, count }: { avg?: number | null; count?: number | null }) {
  if (!count || avg == null) return <span className="cb-ticket-stars" aria-label="not yet rated">—</span>;
  const full = Math.round(avg);
  return (
    <span className="cb-ticket-stars" aria-label={`${avg.toFixed(1)} stars from ${count} ratings`}>
      {"★".repeat(full)}{"☆".repeat(5 - full)}
      <em>{avg.toFixed(1)}</em>
    </span>
  );
}
