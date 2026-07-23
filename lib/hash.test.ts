import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./hash";

describe("password hashing", () => {
  it("hash differs from input and verifies", async () => {
    const h = await hashPassword("abcdefgh");
    expect(h).not.toBe("abcdefgh");
    expect(await verifyPassword("abcdefgh", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  });
});
