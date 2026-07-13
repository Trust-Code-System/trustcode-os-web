import { test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

test("captures the redesigned login at desktop and mobile widths", async ({ page }) => {
  const artifactDir = join(process.cwd(), "artifacts", "reference-redesign");
  await mkdir(artifactDir, { recursive: true });

  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: width === 320 ? 900 : 800 });
    await page.goto("/login");
    await page.getByRole("heading", { name: "Welcome back" }).waitFor();
    await page.screenshot({
      path: join(artifactDir, `login-${width}.png`),
      fullPage: true,
    });
  }
});
