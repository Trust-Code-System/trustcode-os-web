import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { join } from "node:path";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  const response = page.waitForResponse((item) => item.url().endsWith("/api/session/login") && item.request().method() === "POST");
  await page.getByRole("button", { name: "Sign in" }).click();
  expect((await response).ok()).toBe(true);
});

test("shared selects replace native dropdowns and support keyboard selection", async ({ page }) => {
  await page.goto("/clients");
  await expect(page.locator("select")).toHaveCount(0);

  const status = page.getByRole("combobox", { name: "Filter by status" });
  await status.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/status=/);

  await page.goto("/dev/components");
  await expect(page.locator("select")).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "Example select" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Example multi-select" })).toBeVisible();
});

test("profile photo can be previewed, uploaded, replaced, and removed", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "desktop project owns the upload lifecycle; mobile responsiveness is checked separately");
  await page.goto("/settings");
  const fileInput = page.getByLabel("Choose profile photo");
  await fileInput.setInputFiles(join(process.cwd(), "public", "brand", "trustcode-systems-logo.png"));
  await expect(page.getByText("Preview", { exact: true })).toBeVisible();

  const uploadResponse = page.waitForResponse((item) => item.url().endsWith("/api/backend/profile/avatar") && item.request().method() === "POST");
  await page.getByRole("button", { name: "Save photo" }).click();
  expect((await uploadResponse).ok()).toBe(true);
  await expect(page.getByText("Profile photo updated.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Replace photo" })).toBeVisible();

  const removeResponse = page.waitForResponse((item) => item.url().endsWith("/api/backend/profile/avatar") && item.request().method() === "DELETE");
  await page.getByRole("button", { name: "Remove photo" }).click();
  expect((await removeResponse).ok()).toBe(true);
  await expect(page.getByText("Profile photo removed.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Upload photo" })).toBeVisible();
});

test("refined settings remain accessible and responsive on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Profile photo" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});
