import { describe, expect, it } from "vitest";
import { advanceSidebar, sidebarGeometry } from "./sidebar-spring";

describe("sidebar spring", () => {
  it("settles consistently at different refresh rates", () => {
    for (const hz of [30, 60, 120]) {
      let model = { position: 0, velocity: 0 };
      for (let frame = 0; frame < hz; frame++) model = advanceSidebar(model.position, model.velocity, 1, 1 / hz);
      expect(model.position).toBeCloseTo(1, 4);
      expect(Math.abs(model.velocity)).toBeLessThan(0.001);
    }
  });
  it("keeps position continuous when the target reverses", () => {
    const closing = advanceSidebar(0, 0, 1, 0.14);
    const reversing = advanceSidebar(closing.position, closing.velocity, 0, 0.001);
    expect(Math.abs(reversing.position - closing.position)).toBeLessThan(0.01);
    expect(reversing.velocity).toBeGreaterThan(0);
    const opened = advanceSidebar(reversing.position, reversing.velocity, 0, 1);
    expect(opened.position).toBeCloseTo(0, 4);
  });
  it("keeps the workspace still during the initial lift and releases all space", () => {
    expect(sidebarGeometry(0).space).toBe(256);
    expect(sidebarGeometry(0.25).space).toBe(256);
    expect(sidebarGeometry(0.65).space).toBeGreaterThan(0);
    expect(sidebarGeometry(1).space).toBe(0);
  });
});
