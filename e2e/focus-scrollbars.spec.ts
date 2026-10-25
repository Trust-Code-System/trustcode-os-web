import { expect, test } from "@playwright/test";

test("document studios keep quiet field focus and slim document scrollbars", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  for (const route of ["/documents/invoices", "/documents/contracts"]) {
    await page.goto(route);
    const field = page.locator("input:visible:not([type=checkbox]):not([type=radio])").first();
    await field.focus();
    await expect(field).toHaveCSS("outline-style", "none");
    await expect(page.locator("html")).toHaveCSS("scrollbar-color", "auto");
    expect(await page.evaluate(() => window.innerWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(4);
    await page.emulateMedia({ forcedColors: "active" });
    await expect(field).toHaveCSS("outline-style", "solid");
    await page.emulateMedia({ forcedColors: "none" });
  }
});
