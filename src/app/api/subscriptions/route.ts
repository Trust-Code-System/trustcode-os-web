import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyStudioAccess } from "@/features/studios/server/access";
import { subscriptionsFileSchema } from "@/features/apps/subscriptions";
import { readWorkspaceSubscriptions, saveWorkspaceSubscriptions } from "@/features/apps/server/store";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", Vary: "Cookie", "X-Content-Type-Options": "nosniff" };
const inputSchema = z.object({ revision: z.number().int().nonnegative(), subscriptions: subscriptionsFileSchema.shape.subscriptions }).strict();
const failure = (status: number, code: string, message: string) => NextResponse.json({ ok: false, error: { code, message } }, { status, headers });

async function authorize() {
  const access = await verifyStudioAccess(true);
  return access.ok ? null : failure(access.status, access.status === 401 ? "UNAUTHORIZED" : "ACCESS_UNAVAILABLE", access.status === 401 ? "Sign in to your company workspace." : "Workspace access could not be verified. Please try again.");
}

export async function GET() {
  const denied = await authorize();
  if (denied) return denied;
  try {
    return NextResponse.json({ ok: true, data: await readWorkspaceSubscriptions() }, { headers });
  } catch {
    console.error("Workspace subscriptions read failed");
    return failure(503, "SUBSCRIPTIONS_UNAVAILABLE", "Workspace subscriptions are temporarily unavailable. Please try again.");
  }
}

export async function PUT(request: NextRequest) {
  // Next.js may expose the internal listener URL behind a proxy. Host and the
  // proxy's protocol describe the origin the browser actually opened.
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.slice(0, -1);
  if (request.headers.get("origin") !== `${protocol}://${host}`) return failure(403, "INVALID_ORIGIN", "Open this workspace to save subscriptions.");
  const denied = await authorize();
  if (denied) return denied;
  let text: string;
  try { text = await request.text(); }
  catch { return failure(400, "INVALID_BODY", "Choose valid subscription data."); }
  if (Buffer.byteLength(text) > 4_000_000) return failure(413, "SUBSCRIPTIONS_TOO_LARGE", "Workspace subscriptions exceed 4 MB. Use smaller logos or remove unused entries.");
  let input: z.infer<typeof inputSchema>;
  try { input = inputSchema.parse(JSON.parse(text)); }
  catch { return failure(422, "INVALID_SUBSCRIPTIONS", "Check subscription details, dates, and logo files."); }
  try {
    const saved = await saveWorkspaceSubscriptions(input.revision, input.subscriptions);
    if (!saved) return failure(409, "SUBSCRIPTIONS_CONFLICT", "A teammate updated subscriptions. Reopen the form and try your change again.");
    return NextResponse.json({ ok: true, data: saved }, { headers });
  } catch {
    console.error("Workspace subscriptions save failed");
    return failure(503, "SUBSCRIPTIONS_UNAVAILABLE", "Workspace subscriptions could not be saved. Please try again.");
  }
}
