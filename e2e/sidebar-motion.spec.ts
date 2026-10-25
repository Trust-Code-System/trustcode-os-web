import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Delivery snapshot", exact: true })).toBeVisible();
});

test("soft fold supports focus, reversal, dragging and reduced motion", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "desktop fold has a mobile drawer alternative");
  await page.setViewportSize({ width: 1440, height: 1000 });
  const root = page.locator(".app-frame");
  const main = page.locator("#main-content");
  await page.screenshot({ path: testInfo.outputPath("dashboard-open.png") });
  const open = await main.boundingBox();
  const recording = page.evaluate(() => new Promise<{ progress: number; blur: number; time: number }[]>((resolve) => {
    const samples: { progress: number; blur: number; time: number }[] = [];
    const started = performance.now();
    const sample = () => {
      const node = document.querySelector<HTMLElement>(".app-frame")!;
      samples.push({ progress: Number(node.dataset.sidebarProgress), blur: parseFloat(node.style.getPropertyValue("--sidebar-blur")), time: performance.now() - started });
      if (performance.now() - started < 1100) requestAnimationFrame(sample); else resolve(samples);
    };
    requestAnimationFrame(sample);
  }));
  await page.getByRole("navigation", { name: "Primary navigation", exact: true }).getByRole("link", { name: "Projects", exact: true }).focus();
  await page.keyboard.press("Control+b");
  await expect(page.getByRole("button", { name: "Expand sidebar", exact: true })).toBeFocused();
  await expect(page.locator("#os-desktop-navigation")).toHaveAttribute("inert", "");
  await expect(root).toHaveAttribute("data-sidebar-state", "folded");
  const samples = await recording;
  await writeFile(testInfo.outputPath("fold-trajectory.json"), JSON.stringify(samples, null, 2));
  expect(samples.some((sample) => sample.progress > 0.1 && sample.progress < 0.9 && sample.blur > 1)).toBe(true);
  await testInfo.attach("fold-trajectory.json", { body: JSON.stringify(samples), contentType: "application/json" });
  expect((await main.boundingBox())!.width).toBeGreaterThan(open!.width + 250);
  await page.screenshot({ path: testInfo.outputPath("dashboard-folded.png") });

  await page.getByRole("button", { name: "Expand sidebar", exact: true }).click();
  await page.waitForFunction(() => Number(document.querySelector<HTMLElement>(".app-frame")?.dataset.sidebarProgress) < 0.9);
  await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
  await expect(root).toHaveAttribute("data-sidebar-state", "folded");
  await page.getByRole("button", { name: "Expand sidebar", exact: true }).click();
  await expect(root).toHaveAttribute("data-sidebar-state", "open");
  const edge = await page.getByRole("button", { name: "Collapse sidebar by dragging", exact: true }).boundingBox();
  await page.mouse.move(edge!.x + edge!.width / 2, 250);
  await page.mouse.down();
  await page.mouse.move(edge!.x - 210, 250, { steps: 12 });
  await page.mouse.up();
  await expect(root).toHaveAttribute("data-sidebar-state", "folded");

  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.getByRole("button", { name: "Expand sidebar", exact: true }).click();
  await expect(root).toHaveAttribute("data-sidebar-state", "open");
  await expect(page.locator("#os-desktop-navigation")).not.toHaveAttribute("inert", "");
  await page.screenshot({ path: testInfo.outputPath("dashboard-forced-colors.png") });
  await page.emulateMedia({ forcedColors: "none" });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("workspace remains usable on phones, tablets and desktop", async ({ page }, testInfo) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${width}px document`).toBe(0);
    expect(await page.locator("#main-content").evaluate((node) => node.scrollWidth - node.clientWidth), `${width}px workspace`).toBe(0);
    if (width === 375) await page.screenshot({ path: testInfo.outputPath("dashboard-phone.png") });
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation", exact: true })).toBeVisible();
  await page.locator(".ui-dialog-panel").evaluate((node) => Promise.all(node.getAnimations().map((animation) => animation.finished)));
  await page.screenshot({ path: testInfo.outputPath("mobile-drawer.png") });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open navigation", exact: true })).toBeFocused();
});

test("workspace search filters pages, contains focus and respects editing shortcuts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.keyboard.press("Control+k");
  const search = page.getByRole("textbox", { name: "Find a page", exact: true });
  await expect(search).toBeFocused();
  await search.fill("document");
  await expect(page.getByRole("navigation", { name: "Quick navigation" }).getByRole("link")).toHaveCount(1);
  await page.keyboard.press("Control+b");
  await expect(page.locator(".app-frame")).toHaveAttribute("data-sidebar-state", "open");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("navigation", { name: "Quick navigation" }).getByRole("link", { name: "Documents" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/documents$/);
  await expect(page.getByRole("heading", { name: "Prepare your next engagement" })).toBeVisible();
});
