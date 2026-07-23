import { describe, it, expect } from "vitest";
import { canTransition, applyTransition, genOtp, ACTIONS, type OrderState } from "./orders";

const base: OrderState = {
  status: "CREATED",
  escrowStatus: "AWAITING_DEPOSIT",
  deliveryOtp: null,
  deliveryPartner: null,
  deliveryTrackingCode: null,
};

describe("deposit (buyer)", () => {
  it("buyer deposits: escrow AWAITING_DEPOSIT -> HELD", () => {
    expect(canTransition(base, "deposit", "buyer")).toBeNull();
    const next = applyTransition(base, "deposit", "buyer", {});
    expect(next.escrowStatus).toBe("HELD");
    expect(next.status).toBe("CREATED"); // status unchanged by deposit
  });
  it("traveler/ops cannot deposit", () => {
    expect(canTransition(base, "deposit", "traveler")).toMatch(/buyer/i);
    expect(canTransition(base, "deposit", "ops")).toMatch(/buyer/i);
  });
  it("cannot deposit twice", () => {
    const held = { ...base, escrowStatus: "HELD" };
    expect(canTransition(held, "deposit", "buyer")).toBeTruthy();
  });
});

describe("traveler chain", () => {
  const held = { ...base, escrowStatus: "HELD" };
  it("purchased requires escrow HELD", () => {
    expect(canTransition(base, "purchased", "traveler")).toMatch(/deposit|escrow/i);
    expect(canTransition(held, "purchased", "traveler")).toBeNull();
  });
  it("purchased -> boarded -> landed in order", () => {
    let o = applyTransition(held, "purchased", "traveler", {});
    expect(o.status).toBe("PURCHASED");
    expect(canTransition(o, "landed", "traveler")).toBeTruthy(); // can't skip boarded
    o = applyTransition(o, "boarded", "traveler", {});
    expect(o.status).toBe("IN_TRANSIT");
    o = applyTransition(o, "landed", "traveler", {});
    expect(o.status).toBe("LANDED");
  });
  it("buyer cannot advance traveler steps", () => {
    expect(canTransition(held, "purchased", "buyer")).toMatch(/traveler/i);
  });
});

describe("ops middleman chain", () => {
  const landed = { ...base, status: "LANDED", escrowStatus: "HELD" };
  it("receive_hub: LANDED -> AT_HUB (ops only)", () => {
    expect(canTransition(landed, "receive_hub", "ops")).toBeNull();
    expect(canTransition(landed, "receive_hub", "traveler")).toMatch(/ops/i);
    expect(applyTransition(landed, "receive_hub", "ops", {}).status).toBe("AT_HUB");
  });
  it("assign_courier requires a partner and sets otp + tracking", () => {
    const atHub = { ...landed, status: "AT_HUB" };
    expect(canTransition(atHub, "assign_courier", "ops", {})).toMatch(/partner/i);
    const next = applyTransition(atHub, "assign_courier", "ops", { partner: "Dunzo Local" });
    expect(next.status).toBe("OUT_FOR_DELIVERY");
    expect(next.deliveryPartner).toBe("Dunzo Local");
    expect(next.deliveryOtp).toMatch(/^\d{6}$/);
    expect(next.deliveryTrackingCode).toMatch(/^CB-/);
  });
  it("deliver requires the correct OTP", () => {
    const out = { ...landed, status: "OUT_FOR_DELIVERY", deliveryOtp: "123456" };
    expect(canTransition(out, "deliver", "ops", { otp: "000000" })).toMatch(/otp/i);
    expect(canTransition(out, "deliver", "ops", { otp: "123456" })).toBeNull();
    expect(applyTransition(out, "deliver", "ops", { otp: "123456" }).status).toBe("DELIVERED");
  });
});

describe("confirm + escrow release", () => {
  it("buyer confirms: DELIVERED -> CONFIRMED, escrow HELD -> RELEASED", () => {
    const delivered = { ...base, status: "DELIVERED", escrowStatus: "HELD" };
    expect(canTransition(delivered, "confirm", "buyer")).toBeNull();
    const done = applyTransition(delivered, "confirm", "buyer", {});
    expect(done.status).toBe("CONFIRMED");
    expect(done.escrowStatus).toBe("RELEASED");
  });
  it("cannot confirm before delivery", () => {
    expect(canTransition({ ...base, escrowStatus: "HELD" }, "confirm", "buyer")).toBeTruthy();
  });
});

describe("misc", () => {
  it("unknown action rejected", () => {
    expect(canTransition(base, "teleport" as any, "buyer")).toBeTruthy();
  });
  it("genOtp is 6 digits", () => {
    for (let i = 0; i < 20; i++) expect(genOtp()).toMatch(/^\d{6}$/);
  });
  it("ACTIONS lists all 8", () => {
    expect(ACTIONS).toEqual(["deposit", "purchased", "boarded", "landed", "receive_hub", "assign_courier", "deliver", "confirm"]);
  });
});
