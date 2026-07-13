import { expect, test, type Page } from "@playwright/test";

test("protected routes return to the intended page after mock login", async ({ page }) => {
  await page.goto("/clients?status=ACTIVE");
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  await submitLogin(page);
  await expect(page).toHaveURL(/\/clients\?status=ACTIVE/);
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
});

test("client list search is URL-backed and detail is usable", async ({ page }) => {
  await page.goto("/login");
  await submitLogin(page);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.goto("/clients");
  await page.getByRole("searchbox", { name: "Search clients" }).fill("Northstar");
  await expect(page).toHaveURL(/q=Northstar/);
  await expect(page.getByRole("link", { name: /Northstar Logistics/ }).first()).toBeVisible();
  await page.getByRole("link", { name: /Northstar Logistics/ }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Northstar Logistics" })).toBeVisible();
  await page.getByRole("tab", { name: /Contacts/ }).click();
  await expect(page.getByText("Operations lead")).toBeVisible();
});

test("mobile shell opens without horizontal overflow", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "mobile project only");
  await page.goto("/login");
  await submitLogin(page);
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("Client CRM has no horizontal overflow at target breakpoints", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "desktop project controls all target widths");
  await page.goto("/login");
  await submitLogin(page);
  await page.goto("/clients");
  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow, `viewport ${width}px should not overflow`).toBe(false);
  }
});

test("member sessions cannot access team administration", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email address" }).fill("member@trustcode.test");
  await submitLogin(page);
  await page.goto("/team");
  await expect(page.getByRole("heading", { level: 1, name: "Team" })).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "Access denied" })).toContainText("Access denied");
});

async function submitLogin(page: Page) {
  const loginResponse = page.waitForResponse((response) => response.url().endsWith("/api/session/login") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Sign in" }).click();
  expect((await loginResponse).ok()).toBe(true);
}
