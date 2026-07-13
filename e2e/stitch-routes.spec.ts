import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const routes = [
  ["dashboard", "/dashboard", "Good evening, Ghost"],
  ["clients", "/clients", "Clients"],
  ["client-profile", "/clients/northstar-logistics", "Northstar Logistics"],
  ["projects", "/projects", "Projects"],
  ["project-workspace", "/projects/core-api-refactor", "Core API Refactor"],
  ["meetings", "/meetings", "Meetings"],
  ["documents", "/documents", "Document Center"],
  ["team", "/team", "Team"],
  ["activity", "/activity", "Activity Feed"],
  ["settings", "/settings", "Settings"],
] as const;

test("approved Stitch routes are responsive, accessible, and captured", async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  test.skip(testInfo.project.name.includes("mobile"), "desktop project controls all validation widths");
  await page.goto("/login");
  await submitLogin(page);
  const artifactDir = join(process.cwd(), "artifacts", "stitch-validation");
  mkdirSync(artifactDir, { recursive: true });

  for (const [slug, route, heading] of routes) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations, `${route} should have no automated WCAG A/AA violations`).toEqual([]);

    for (const width of [320, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      const overflow = await page.evaluate(() => ({
        page: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        offenders: [...document.querySelectorAll<HTMLElement>("body *")].filter((element) => element.getBoundingClientRect().right > window.innerWidth + 1).slice(0, 5).map((element) => ({ tag: element.tagName, className: element.className, right: Math.round(element.getBoundingClientRect().right) })),
      }));
      expect(overflow.page, `${route} at ${width}px should not overflow; offenders: ${JSON.stringify(overflow.offenders)}`).toBe(false);
      await page.screenshot({ path: join(artifactDir, `${slug}-${width}.png`), fullPage: true });
    }
  }
});

async function submitLogin(page: Page) {
  const response = page.waitForResponse((item) => item.url().endsWith("/api/session/login") && item.request().method() === "POST");
  await page.getByRole("button", { name: "Sign in" }).click();
  expect((await response).ok()).toBe(true);
}
