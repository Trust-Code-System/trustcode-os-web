import { expect, test } from "@playwright/test";

test("application shell owns the viewport and only main content scrolls", async ({ page }) => {
  await page.goto("/login");
  const loginResponse = page.waitForResponse((response) => response.url().endsWith("/api/session/login") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Sign in" }).click();
  expect((await loginResponse).ok()).toBe(true);
  await expect(page).toHaveURL(/\/dashboard$/);

  for (const viewport of [{ width: 1280, height: 600 }, { width: 768, height: 600 }, { width: 320, height: 568 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/dashboard");

    const header = page.locator(".app-frame > div > header");
    const main = page.locator("#main-content");
    const frame = page.locator(".app-frame");
    const sidebar = page.locator("aside").first();

    const initialHeader = await header.boundingBox();
    const initialSidebar = viewport.width >= 1024 ? await sidebar.boundingBox() : null;
    const frameBox = await frame.boundingBox();

    expect(frameBox).toMatchObject({ x: 0, y: 0, width: viewport.width, height: viewport.height });
    expect(await page.evaluate(() => ({
      bodyOverflow: getComputedStyle(document.body).overflow,
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
      bodyScroll: document.body.scrollHeight - document.body.clientHeight,
      pageScroll: document.documentElement.scrollHeight - document.documentElement.clientHeight,
      horizontalScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }))).toEqual({ bodyOverflow: "hidden", htmlOverflow: "hidden", bodyScroll: 0, pageScroll: 0, horizontalScroll: 0 });

    await main.evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
    await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

    expect(await header.boundingBox()).toEqual(initialHeader);
    if (initialSidebar) expect(await sidebar.boundingBox()).toEqual(initialSidebar);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  }
});
