import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
});

test("every workspace destination and detail tab uses the shared interaction layer", async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  if (testInfo.project.name.includes("mobile")) await page.setViewportSize({ width: 320, height: 812 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const routes = ["/dashboard", "/clients", "/clients/new", "/projects", "/meetings", "/documents", "/activity", "/team", "/settings", "/settings/profile", "/settings/security", "/settings/appearance", "/settings/notifications"];
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator(".route-enter")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("select:visible")).toHaveCount(0);
    expect(await page.locator("#main-content").evaluate((node) => node.scrollWidth - node.clientWidth), route).toBeLessThanOrEqual(1);
    const scrollbar = await page.locator("#main-content").evaluate((node) => getComputedStyle(node, "::-webkit-scrollbar").width);
    expect(scrollbar).toBe("4px");
    await expect(page.locator("#main-content")).toHaveCSS("scrollbar-color", "auto");
    expect([0, 4]).toContain(await page.locator("#main-content").evaluate((node) => node.offsetWidth - node.clientWidth));
  }
  for (const route of ["/clients/northstar-logistics", "/projects/northstar-logistics-project"]) {
    await page.goto(route);
    const tabs = page.getByRole("tablist", { name: "Detail sections" });
    await expect(tabs).toBeVisible();
    const count = await tabs.getByRole("tab").count();
    for (let index = 0; index < count; index++) {
      const tab = tabs.getByRole("tab").nth(index);
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      await expect(tab.locator('[data-micro="rubber-segment"]')).toHaveCount(1);
      await expect(page.getByRole("tabpanel")).toBeVisible();
      expect(await page.locator("#main-content").evaluate((node) => node.scrollWidth - node.clientWidth), `${route} tab ${index}`).toBeLessThanOrEqual(1);
    }
    await tabs.getByRole("tab").last().press("Home");
    await expect(tabs.getByRole("tab").first()).toHaveAttribute("aria-selected", "true");
    await tabs.getByRole("tab").first().press("End");
    await expect(tabs.getByRole("tab").last()).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toHaveCSS("opacity", "1");
    await page.screenshot({ path: testInfo.outputPath(`${route.includes("clients") ? "client" : "project"}-tabs.png`) });
  }
  expect(errors).toEqual([]);
});

test("gliding controls, paused notifications and keyboard alternatives work", async ({ page }, testInfo) => {
  await page.goto("/dev/components");
  const select = page.getByRole("combobox", { name: "Example select" });
  await select.click();
  await expect(page.getByRole("listbox")).toHaveClass(/ui-floating/);
  const option = page.getByRole("option", { name: "Development", exact: true });
  await option.focus();
  await expect(option.locator('[data-micro="glide-select"]')).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(select).toContainText("Development");
  await expect(select).toBeFocused();
  const checkbox = page.getByRole("checkbox", { name: "Checkbox option", exact: true });
  await page.getByText("Checkbox option", { exact: true }).click();
  await expect(checkbox).toBeChecked();
  await expect.poll(() => page.locator(".spring-check-box path").evaluate((node) => getComputedStyle(node).strokeDashoffset)).toBe("0px");
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(checkbox).not.toBeChecked();
  const toggle = page.getByRole("switch", { name: "Enable preference" });
  await toggle.click();
  await expect(toggle).toBeChecked();

  await page.getByRole("button", { name: "Preview notification", exact: true }).click();
  const notice = page.locator('[data-micro="swipe-toast"]');
  await expect(notice).toContainText("Notification preview");
  await notice.getByRole("button", { name: "Dismiss notification" }).focus();
  await expect(notice).toHaveCSS("opacity", "1");
  await expect.poll(() => notice.locator(".toast-fuse").evaluate((node) => node.getAnimations()[0]?.playState)).toBe("paused");
  await page.screenshot({ path: testInfo.outputPath("controls-notification.png") });
  await page.keyboard.press("Escape");
  await expect(notice).toHaveCount(0);
  await page.getByRole("button", { name: "Preview error", exact: true }).click();
  await expect(notice).toHaveAttribute("role", "alert");
  await expect(notice.locator(".toast-fuse")).toHaveCount(0);
  await notice.getByRole("button", { name: "Dismiss notification" }).click();
  await expect(notice).toHaveCount(0);

  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  await expect.poll(() => toggle.locator("span > span").evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41), { timeout: 250 }).toBe(0);
  await page.getByRole("button", { name: "Preview notification", exact: true }).click();
  await expect(notice.locator(".toast-fuse")).toHaveCSS("visibility", "hidden");
  await notice.getByRole("button", { name: "Dismiss notification" }).click();
  await page.emulateMedia({ forcedColors: "none" });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("a notification can be swiped down with a pointer", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "physical pointer gesture; mobile gets semantic dismiss coverage");
  await page.goto("/dev/components");
  await page.getByRole("button", { name: "Preview notification", exact: true }).click();
  const notice = page.locator('[data-micro="swipe-toast"]');
  await expect(notice).toBeVisible();
  await notice.evaluate((node) => Promise.all(node.getAnimations().map((animation) => animation.finished)));
  const box = (await notice.boundingBox())!;
  await page.mouse.move(box.x + 35, box.y + 8);
  await page.mouse.down();
  await page.mouse.move(box.x + 35, box.y + 70, { steps: 10 });
  await page.mouse.up();
  await expect(notice).toHaveCount(0);
});
