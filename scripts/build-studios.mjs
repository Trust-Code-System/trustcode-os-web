import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const text = (file) => readFile(path.join(root, file), "utf8");
await mkdir(path.join(root, ".studio-build"), { recursive: true });
execFileSync(process.execPath, [path.join(root, "studios/contracts/build-micro.mjs")], { cwd: root, stdio: "inherit" });
const fonts = await text("studios/shared/fonts.css");
const logo = (await readFile(path.join(root, "studios/shared/logo.png"))).toString("base64");
const dropdown = await text("studios/shared/dropdown.js");
const app = (await text("studios/contracts/app.js")).replace("__DROPDOWN__", () => dropdown);

for (const kind of ["invoice", "contract"]) {
  let html = await text(kind === "invoice" ? "studios/invoice/index.template.html" : "studios/contracts/index.template.html");
  const replacements = { FONT: fonts, LOGO: logo };
  if (kind === "contract") Object.assign(replacements, {
    CSS: await text("studios/contracts/styles.css"),
    APP: app,
    CALENDAR: await text("studios/shared/calendar.js"),
    ZIP: await text("studios/shared/jszip.min.js"),
    MICRO_CSS: await text(".studio-build/contract-micro.css"),
    MICRO_JS: (await text(".studio-build/contract-micro.js")).replaceAll("</script", "<\\/script"),
  });
  // Bundled JavaScript contains $& and $' literals; never interpret them as
  // replacement-string substitutions when embedding a bundle.
  for (const [key, value] of Object.entries(replacements)) html = html.replaceAll(`__${key}__`, () => value);
  html = html.replace(/href="(TrustCode-[^"/]+\.(?:pdf|docx|xlsx))"/g, (_, name) => `href="/api/studios/${kind}/${name}"`);
  const headerStart = html.indexOf('<header class="appbar"');
  const headerEnd = html.indexOf("</header>", headerStart) + "</header>".length;
  if (headerStart < 0 || headerEnd < 9) throw new Error("Studio header missing: " + kind);
  let header = html.slice(headerStart, headerEnd);
  header = header.replaceAll('href="https://trustcodesystem.tech/"', 'href="/documents" target="_top"');
  header = header.replaceAll('href="https://invoice.trustcodesystem.tech/"', 'href="/documents/invoices" target="_top"');
  header = header.replaceAll('href="https://contracts.trustcodesystem.tech/"', 'href="/documents/contracts" target="_top"');
  html = html.slice(0, headerStart) + header + html.slice(headerEnd);
  await writeFile(path.join(root, "studio-assets", kind, "index.html"), html);
  console.log(`Built authenticated ${kind} studio (${Buffer.byteLength(html)} bytes)`);
}
