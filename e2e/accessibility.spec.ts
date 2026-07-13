import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("login and Client CRM have no automated WCAG A/AA violations", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "covered once in the desktop accessibility project");
  await page.goto("/login");
  await expect(page.getByRole("heading", { level: 1, name: "Welcome back" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  const loginResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(loginResults.violations).toEqual([]);

  const response = page.waitForResponse((item) => item.url().endsWith("/api/session/login") && item.request().method() === "POST");
  await page.getByRole("button", { name: "Sign in" }).click();
  expect((await response).ok()).toBe(true);
  await page.goto("/clients");
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
  const clientResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(clientResults.violations).toEqual([]);
});
