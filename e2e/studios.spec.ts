import { expect, test } from "@playwright/test";

test("document editors and files require a session", async ({ page, request }) => {
  await page.goto("/documents/contracts");
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  for (const asset of ["invoice/index.html", "contract/index.html", "contract/TrustCode-NDA.pdf", "invoice/TrustCode-Invoice-Template.xlsx"]) {
    const response = await request.get(`/api/studios/${asset}`);
    expect(response.status()).toBe(401);
    expect(response.headers()["cache-control"]).toContain("no-store");
  }
  const forged = Buffer.from(JSON.stringify({ id: "forged", email: "forged@example.test", role: "ADMIN" })).toString("base64url");
  expect((await request.get("/api/studios/invoice/index.html", { headers: { Cookie: `tc_session_user=${forged}` } })).status()).toBe(401);
});

test("both studios work inside Documents across phone and desktop widths", async ({ page, context }, testInfo) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/login?returnTo=%2Fdocuments");
  await page.getByRole("textbox", { name: "Email address" }).fill("admin@trustcode.test");
  await page.getByLabel("Password", { exact: false }).fill("TrustCode123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Prepare your next engagement" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("documents.png") });

  for (const [kind, route] of [["invoice", "invoices"], ["contract", "contracts"]] as const) {
    await page.goto(`/documents/${route}`);
    const frame = page.frameLocator("iframe");
    await expect(frame.locator(".appbar")).toBeVisible();
    if (kind === "contract") await expect(frame.locator("html")).toHaveAttribute("data-micro", "react-bits");
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 600 ? 812 : 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `${route} shell ${width}px`).toBe(false);
      const bounds = await page.locator("iframe").boundingBox();
      expect(bounds?.height).toBeGreaterThan(300);
      const inner = await frame.locator("html").evaluate((element) => ({ scroll: element.scrollWidth, width: innerWidth }));
      expect(inner.scroll, `${route} editor ${width}px`).toBeLessThanOrEqual(inner.width);
      if (width === 375 || width === 1440) await page.screenshot({ path: testInfo.outputPath(`${kind}-${width}.png`) });
    }
  }
  for (const [kind, file] of [["invoice", "TrustCode-Invoice-Template.pdf"], ["invoice", "TrustCode-Invoice-Template.docx"], ["invoice", "TrustCode-Invoice-Template.xlsx"], ["contract", "TrustCode-Service-Agreement.pdf"], ["contract", "TrustCode-Service-Agreement.docx"], ["contract", "TrustCode-NDA.pdf"], ["contract", "TrustCode-NDA.docx"]] as const) {
    const response = await context.request.get(`/api/studios/${kind}/${file}`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-disposition"]).toContain(file);
    const bytes = await response.body();
    expect(bytes.subarray(0, file.endsWith("pdf") ? 4 : 2).toString()).toBe(file.endsWith("pdf") ? "%PDF" : "PK");
  }
  await context.clearCookies();
  expect((await context.request.get("/api/studios/invoice/index.html")).status()).toBe(401);
  expect(errors).toEqual([]);
});
