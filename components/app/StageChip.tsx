import { STAGE_LABELS } from "@/lib/orders";

// Status pill: amber = in progress, leaf = terminal good, lilac = escrow states.
const TONE: Record<string, string> = {
  CREATED: "amber", PURCHASED: "amber", IN_TRANSIT: "amber", LANDED: "amber",
  AT_HUB: "amber", OUT_FOR_DELIVERY: "amber", DELIVERED: "leaf", CONFIRMED: "leaf",
  AWAITING_DEPOSIT: "lilac", HELD: "lilac", RELEASED: "leaf", REFUNDED: "grey",
  OPEN: "amber", MATCHED: "lilac", FULFILLED: "leaf", CANCELLED: "grey",
  PROPOSED: "amber", ACCEPTED: "leaf", DECLINED: "grey",
  UPCOMING: "amber", ACTIVE: "lilac", COMPLETED: "leaf",
};

export default function StageChip({ value, label }: { value: string; label?: string }) {
  const tone = TONE[value] ?? "grey";
  return <span className={`cb-chip cb-chip-${tone}`}>{label ?? STAGE_LABELS[value] ?? value.replaceAll("_", " ").toLowerCase()}</span>;
}
