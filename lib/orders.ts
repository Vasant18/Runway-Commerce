// Order lifecycle state machine — the single source of truth for who can move an
// order from where to where. Pure: the API route provides the actor role (after
// verifying session identity against the order) and persists the returned patch.

export type ActorRole = "buyer" | "traveler" | "ops";

export type OrderState = {
  status: string;        // OrderStatus enum value
  escrowStatus: string;  // EscrowStatus enum value
  deliveryOtp: string | null;
  deliveryPartner: string | null;
  deliveryTrackingCode: string | null;
};

export type Action =
  | "deposit" | "purchased" | "boarded" | "landed"
  | "receive_hub" | "assign_courier" | "deliver" | "confirm";

export const ACTIONS: Action[] = [
  "deposit", "purchased", "boarded", "landed",
  "receive_hub", "assign_courier", "deliver", "confirm",
];

type Transition = {
  actor: ActorRole;
  // status gate (null = any) and escrow gate (null = any)
  fromStatus: string | null;
  fromEscrow: string | null;
  toStatus: string | null;   // null = unchanged
  toEscrow: string | null;   // null = unchanged
  label: string;             // button label in the UI
};

export const TRANSITIONS: Record<Action, Transition> = {
  deposit: { actor: "buyer", fromStatus: null, fromEscrow: "AWAITING_DEPOSIT", toStatus: null, toEscrow: "HELD", label: "Deposit to escrow" },
  purchased: { actor: "traveler", fromStatus: "CREATED", fromEscrow: "HELD", toStatus: "PURCHASED", toEscrow: null, label: "Mark purchased" },
  boarded: { actor: "traveler", fromStatus: "PURCHASED", fromEscrow: null, toStatus: "IN_TRANSIT", toEscrow: null, label: "Boarded flight" },
  landed: { actor: "traveler", fromStatus: "IN_TRANSIT", fromEscrow: null, toStatus: "LANDED", toEscrow: null, label: "Landed" },
  receive_hub: { actor: "ops", fromStatus: "LANDED", fromEscrow: null, toStatus: "AT_HUB", toEscrow: null, label: "Receive at hub" },
  assign_courier: { actor: "ops", fromStatus: "AT_HUB", fromEscrow: null, toStatus: "OUT_FOR_DELIVERY", toEscrow: null, label: "Assign courier" },
  deliver: { actor: "ops", fromStatus: "OUT_FOR_DELIVERY", fromEscrow: null, toStatus: "DELIVERED", toEscrow: null, label: "Confirm OTP delivery" },
  confirm: { actor: "buyer", fromStatus: "DELIVERED", fromEscrow: "HELD", toStatus: "CONFIRMED", toEscrow: "RELEASED", label: "Confirm received" },
};

export type TransitionInput = { otp?: string; partner?: string };

const ACTOR_MSG: Record<ActorRole, string> = {
  buyer: "Only the buyer can do this.",
  traveler: "Only the traveler can do this.",
  ops: "Only CrossBorder ops can do this.",
};

// Returns null when allowed, else a human-readable reason (same style as validation.ts).
export function canTransition(order: OrderState, action: Action, actor: ActorRole, input: TransitionInput = {}): string | null {
  const t = TRANSITIONS[action];
  if (!t) return "Unknown action.";
  if (actor !== t.actor) return ACTOR_MSG[t.actor];
  if (t.fromStatus && order.status !== t.fromStatus) {
    if (action === "purchased" && order.escrowStatus !== "HELD") return "Waiting for the buyer's escrow deposit.";
    return `Order is not at the right stage (needs ${t.fromStatus}).`;
  }
  if (t.fromEscrow && order.escrowStatus !== t.fromEscrow) {
    if (action === "purchased") return "Waiting for the buyer's escrow deposit.";
    return `Escrow is not at the right stage (needs ${t.fromEscrow}).`;
  }
  if (action === "assign_courier" && !input.partner?.trim()) return "Pick a delivery partner.";
  if (action === "deliver" && input.otp !== order.deliveryOtp) return "Incorrect OTP.";
  return null;
}

export function genOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function genTrackingCode(): string {
  const s = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CB-${s}`;
}

// Applies the transition and returns the new state (throws if illegal — call
// canTransition first at the API boundary for the friendly message).
export function applyTransition(order: OrderState, action: Action, actor: ActorRole, input: TransitionInput = {}): OrderState {
  const err = canTransition(order, action, actor, input);
  if (err) throw new Error(err);
  const t = TRANSITIONS[action];
  const next: OrderState = {
    ...order,
    status: t.toStatus ?? order.status,
    escrowStatus: t.toEscrow ?? order.escrowStatus,
  };
  if (action === "assign_courier") {
    next.deliveryPartner = input.partner!.trim();
    next.deliveryOtp = genOtp();
    next.deliveryTrackingCode = genTrackingCode();
  }
  return next;
}

// Ordered stages for the tracker UI (escrow deposit shown separately).
export const STAGE_ORDER = [
  "CREATED", "PURCHASED", "IN_TRANSIT", "LANDED", "AT_HUB", "OUT_FOR_DELIVERY", "DELIVERED", "CONFIRMED",
] as const;

export const STAGE_LABELS: Record<string, string> = {
  CREATED: "Order placed",
  PURCHASED: "Item purchased",
  IN_TRANSIT: "In flight",
  LANDED: "Landed",
  AT_HUB: "At CrossBorder hub",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CONFIRMED: "Confirmed",
};
