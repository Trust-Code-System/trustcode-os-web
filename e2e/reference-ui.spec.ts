import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("auth fields react to typing while passwords remain in the native password field", async ({ page }, testInfo) => {
  await page.goto("/login");
  const email = page.getByRole("textbox", { name: "Email address", exact: true });
  await email.fill("qa@trustcode.test");
  await expect(page.locator(".auth-reference")).toHaveAttribute("data-auth-focus", "email");
  const password = page.locator('input[autocomplete="current-password"]');
  await password.fill("Example-only-password");
  await expect(password).toHaveAttribute("type", "password");
  await expect(page.locator(".auth-reference")).toHaveAttribute("data-auth-focus", "password");
  await expect(page.locator(".auth-reference")).not.toContainText("Example-only-password");
  await expect(password).toHaveCSS("outline-style", "none");
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: testInfo.outputPath("auth-desktop.png") });
  await expect(page.locator(".auth-contours")).toHaveCSS("animation-name", "auth-contour-flow");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => page.locator(".auth-contours").evaluate((node) => parseFloat(getComputedStyle(node).animationDuration))).toBeLessThan(.001);
});

test.describe("workspace reference update", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Project overview", exact: true })).toBeVisible();
  });

  test("report filtering, branded dropdown, search, selection and CSV export work", async ({ page }) => {
    const period = page.getByRole("combobox", { name: "Reporting period" });
    await period.click();
    await expect(page.getByRole("listbox")).toHaveClass(/ui-select-menu/);
    await page.getByRole("option", { name: "All time", exact: true }).click();
    await expect(period).toContainText("All time");
    await expect(period).toHaveCSS("outline-style", "none");
    await page.getByRole("button", { name: "Weekly", exact: true }).click();
    await expect(page.getByRole("button", { name: "Weekly", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("textbox", { name: "Search projects" }).fill("Northstar");
    const row = page.getByRole("row").filter({ hasText: "Northstar Logistics delivery programme" });
    await expect(row).toHaveCount(1);
    await row.getByRole("checkbox").check();
    await expect(page.getByText("1 selected", { exact: true })).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download report" }).click();
    expect((await downloadPromise).suggestedFilename()).toMatch(/^trustcode-project-report-.*\.csv$/);
    await period.click();
    await page.getByRole("option", { name: "Last 30 days", exact: true }).click();
    await page.getByRole("textbox", { name: "Search projects" }).clear();
    await expect(page.getByText("No projects in this period", { exact: true })).toBeVisible();
  });

  test("code input edits, paste and explicit result previews work", async ({ page }) => {
    await page.goto("/dev/components");
    const input = page.getByRole("textbox", { name: "Verification code", exact: true });
    await input.fill("123456");
    await input.press("Home");
    await input.press("ArrowRight");
    await input.press("Shift+ArrowRight");
    await input.press("9");
    await expect(input).toHaveValue("193456");
    await page.locator(".code-preview").getByRole("button", { name: "Preview error", exact: true }).click();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveValue("193456");
    await page.getByRole("button", { name: "Preview success", exact: true }).click();
    await expect(page.getByText("Code accepted.", { exact: true })).toBeVisible();
    await expect(input).toHaveAttribute("readonly", "");
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(input).toHaveValue("");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await input.fill("654321");
    await page.getByRole("button", { name: "Preview success", exact: true }).click();
    await expect(page.locator(".code-input-confetti")).toHaveCount(0);
  });

  test("dashboard and settings fit supported widths and pass automated accessibility checks", async ({ page }, testInfo) => {
    test.setTimeout(150_000);
    for (const route of ["/dashboard", "/settings", "/settings/team", "/settings/appearance"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(await page.locator("#main-content").evaluate((node) => node.scrollWidth - node.clientWidth), `${route} at ${width}`).toBeLessThanOrEqual(1);
        await expect(page.locator("select:visible")).toHaveCount(0);
      }
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(results.violations, route).toEqual([]);
      if (route === "/settings") {
        const rail = page.getByRole("navigation", { name: "Settings sections" });
        const shellRail = page.getByRole("complementary", { name: "Workspace sidebar" });
        const before = await rail.boundingBox();
        const shellBefore = await shellRail.boundingBox();
        await page.locator(".settings-workspace-content").evaluate((node) => node.scrollTo({ top: node.scrollHeight, behavior: "instant" }));
        expect(await rail.boundingBox()).toEqual(before);
        expect(await shellRail.boundingBox()).toEqual(shellBefore);
        await page.locator(".settings-workspace-content").evaluate((node) => node.scrollTo({ top: 0, behavior: "instant" }));
      }
      await page.screenshot({ path: testInfo.outputPath(`${route.replaceAll("/", "-")}-desktop.png`) });
    }
  });
});
