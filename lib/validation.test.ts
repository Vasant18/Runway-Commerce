import { describe, it, expect } from "vitest";
import { isValidEmail, passwordError, signupError } from "./validation";

describe("isValidEmail", () => {
  it("accepts a normal email", () => expect(isValidEmail("a@b.co")).toBe(true));
  it("rejects missing @", () => expect(isValidEmail("ab.co")).toBe(false));
  it("rejects empty", () => expect(isValidEmail("")).toBe(false));
});

describe("passwordError", () => {
  it("ok for 8+ chars", () => expect(passwordError("abcdefgh")).toBeNull());
  it("too short", () => expect(passwordError("abc")).toMatch(/8/));
});

describe("signupError", () => {
  const ok = { fullName: "Ada", email: "a@b.co", password: "abcdefgh", role: "BUYER" };
  it("passes valid input", () => expect(signupError(ok)).toBeNull());
  it("catches blank name", () => expect(signupError({ ...ok, fullName: " " })).toMatch(/name/i));
  it("catches bad email", () => expect(signupError({ ...ok, email: "x" })).toMatch(/email/i));
  it("catches short password", () => expect(signupError({ ...ok, password: "x" })).toMatch(/8/));
  it("catches bad role", () => expect(signupError({ ...ok, role: "ADMIN" })).toMatch(/role/i));
});
