import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  await expect(page.getByText("Preparing development data…", { exact: true })).toHaveCount(0, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Delivery snapshot", exact: true })).toBeVisible();
}
async function theme(page: Page, name: string) {
  await page.getByRole("button", { name: "Color theme", exact: true }).click();
  await page.getByRole("menuitemradio", { name, exact: true }).click();
  await expect(page.getByRole("button", { name: "Color theme", exact: true })).toHaveAttribute("data-preference", name === "Use device setting" ? "system" : name.toLowerCase());
}
async function settled(page: Page) {
  await expect(page.locator("html")).not.toHaveAttribute("data-transition-kind", /.+/);
}
async function contentSettled(page: Page) {
  await expect(page.locator(".skeleton-shimmer:visible")).toHaveCount(0);
  await page.locator(".route-enter").evaluate((node) => Promise.all(node.getAnimations({ subtree: true }).filter((animation) => animation.effect?.getTiming().iterations !== Infinity).map((animation) => animation.finished.catch(() => undefined))));
}

test("authentication pages work in light and dark at phone and desktop sizes", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of ["/login", "/forgot-password", "/reset-password", "/accept-invite"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.locator(".auth-screen").evaluate((node) => node.scrollWidth - node.clientWidth), route).toBeLessThanOrEqual(1);
    }
  }
  await page.goto("/login");
  await theme(page, "Dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await settled(page);
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`login-dark-${width}.png`) });
  }
  await theme(page, "Light");
  await settled(page);
  await page.screenshot({ path: testInfo.outputPath("login-light.png") });
  expect(errors).toEqual([]);
});

test("theme reveals as a curtain, persists and follows the device setting", async ({ page }, testInfo) => {
  await signIn(page);
  await theme(page, "Dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect.poll(() => page.evaluate(() => document.getAnimations().some((animation) => (animation.effect as KeyframeEffect | null)?.pseudoElement === "::view-transition-new(root)"))).toBe(true);
  const timing = await page.evaluate(() => document.getAnimations().filter((animation) => (animation.effect as KeyframeEffect | null)?.pseudoElement === "::view-transition-new(root)").map((animation) => ({ duration: animation.effect!.getTiming().duration, frames: (animation.effect as KeyframeEffect).getKeyframes().map((frame) => frame.clipPath) })));
  expect(timing[0]?.duration).toBe(1000);
  expect(timing[0]?.frames).toContain("inset(0px 0px 100%)");
  await settled(page);
  await expect(page.getByRole("button", { name: "Color theme", exact: true })).toBeFocused();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("heading", { name: "Delivery snapshot", exact: true })).toBeVisible();
  await contentSettled(page);
  await page.screenshot({ path: testInfo.outputPath("dashboard-dark.png") });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
  await page.emulateMedia({ colorScheme: "light" });
  await theme(page, "Use device setting");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await settled(page);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await theme(page, "Light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).not.toHaveAttribute("data-transition-kind", "theme");
});

test("navigation moves softly, can reverse, and leaves document links as full navigations", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "desktop navigation snapshots; mobile layout is checked separately");
  await signIn(page);
  const nav = page.getByRole("navigation", { name: "Primary navigation", exact: true });
  await nav.getByRole("link", { name: "Clients", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Clients", exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.getAnimations().some((animation) => (animation.effect as KeyframeEffect | null)?.pseudoElement === "::view-transition-new(workspace-content)"))).toBe(true);
  expect(await page.evaluate(() => document.getAnimations().find((animation) => (animation.effect as KeyframeEffect | null)?.pseudoElement === "::view-transition-new(workspace-content)")?.effect?.getTiming().duration)).toBe(720);
  await nav.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
  await settled(page);
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Clients", exact: true })).toBeVisible();
  await page.goto("/documents");
  await page.getByRole("link", { name: "Open invoice studio", exact: true }).click();
  await expect(page).toHaveURL(/\/documents\/invoices$/);
  await expect(page.locator(".appbar")).toBeVisible();
  await expect(page.locator(".app-frame")).toHaveCount(0);
});

test("unsupported browsers retain theme and navigation without snapshot animations", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(Document.prototype, "startViewTransition", { configurable: true, value: undefined }));
  await signIn(page);
  await page.getByRole("link", { name: "View projects", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-transition-kind", /.+/);
  await theme(page, "Dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await theme(page, "Light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).not.toHaveAttribute("data-transition-kind", /.+/);
});

test("dark mode reaches every portal destination and keeps document paper white", async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  await signIn(page);
  await theme(page, "Dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await settled(page);
  for (const route of ["/clients", "/projects", "/meetings", "/documents", "/activity", "/team", "/settings", "/settings/appearance", "/settings/notifications", "/settings/security"]) {
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("h1")).toBeVisible();
    await contentSettled(page);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations, route).toEqual([]);
  }
  for (const [route, paper] of [["contracts", ".paper"], ["invoices", ".sheet"]]) {
    await page.goto(`/documents/${route}`);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator(paper!)).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await page.screenshot({ path: testInfo.outputPath(`${route}-dark.png`) });
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(paper!)).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await page.emulateMedia({ media: "screen" });
  }
});
