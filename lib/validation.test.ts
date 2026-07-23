import { describe, it, expect } from "vitest";
import { isValidEmail, passwordError, signupError, tripError, requestError } from "./validation";

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

describe("tripError", () => {
  const ok = { fromCountry: "USA", toCountry: "India", departDate: "2099-01-01", arriveDate: "2099-01-02", luggageCapacityKg: 10 };
  it("passes valid", () => expect(tripError(ok)).toBeNull());
  it("needs both countries", () => expect(tripError({ ...ok, fromCountry: " " })).toMatch(/countr/i));
  it("countries must differ", () => expect(tripError({ ...ok, toCountry: "USA" })).toMatch(/different/i));
  it("arrive >= depart", () => expect(tripError({ ...ok, arriveDate: "2098-12-31" })).toMatch(/after|before|date/i));
  it("depart not in past", () => expect(tripError({ ...ok, departDate: "2000-01-01", arriveDate: "2000-01-02" })).toMatch(/past|future/i));
  it("luggage > 0 if given", () => expect(tripError({ ...ok, luggageCapacityKg: -1 })).toMatch(/luggage|capacity/i));
});

describe("requestError", () => {
  const ok = { title: "Sony Camera", originCountry: "USA", destinationCountry: "India", productPrice: 4000, travelerReward: 150, localPrice: 5000, currency: "USD" };
  it("passes valid", () => expect(requestError(ok)).toBeNull());
  it("needs a title", () => expect(requestError({ ...ok, title: " " })).toMatch(/title/i));
  it("countries differ", () => expect(requestError({ ...ok, destinationCountry: "USA" })).toMatch(/different/i));
  it("product price > 0", () => expect(requestError({ ...ok, productPrice: 0 })).toMatch(/price/i));
  it("reward >= 0", () => expect(requestError({ ...ok, travelerReward: -5 })).toMatch(/reward/i));
  it("localPrice > 0 if given", () => expect(requestError({ ...ok, localPrice: -1 })).toMatch(/local|price/i));
  it("currency is 3 letters", () => expect(requestError({ ...ok, currency: "US" })).toMatch(/currency/i));
});
