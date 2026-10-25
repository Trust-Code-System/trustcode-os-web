import { describe, expect, it } from "vitest";
import { greetingFor, greetingNotes } from "./greetings";

describe("dashboard greetings", () => {
  it("has 200 unique, local messages with a choice for each time band", () => {
    expect(greetingNotes.flat()).toHaveLength(200);
    expect(new Set(greetingNotes.flat()).size).toBe(200);
    for (const band of greetingNotes) expect(band).toHaveLength(25);
  });
  it("uses local hours and keeps the same message within a time band", () => {
    for (const [hour, period] of [[0,0],[4,1],[6,2],[9,3],[12,4],[15,5],[18,6],[21,7],[23,7]]) {
      const date = new Date(2026, 9, 25, hour!);
      expect(greetingFor(date, 0).period).toBe(period);
      expect(greetingFor(date, 25).note).toBe(greetingFor(date, 0).note);
      expect(greetingFor(date, 1).note).not.toBe(greetingFor(date, 0).note);
    }
  });
});
