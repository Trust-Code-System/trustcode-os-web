import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

import { studioAsset, studioReturnPath } from "@/features/studios/catalog";
import { verifyStudioAccess } from "@/features/studios/server/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
  "Vary": "Cookie",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Content-Security-Policy": "frame-ancestors 'self'; base-uri 'self'; object-src 'none'",
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ resource: string[] }> }) {
  const { resource } = await params;
  const sessionEntry = resource.length === 1 && resource[0] === "session";
  const asset = sessionEntry ? null : studioAsset(resource);
  if (!sessionEntry && !asset) return NextResponse.json({ error: "Not found" }, { status: 404, headers: privateHeaders });

  const access = await verifyStudioAccess(true);
  if (sessionEntry) {
    const target = studioReturnPath(request.nextUrl.searchParams.get("returnTo"));
    const destination = access.ok ? target : `/login?returnTo=${encodeURIComponent(target)}`;
    if (!access.ok && access.status === 503) return failure(503);
    return NextResponse.redirect(new URL(destination, request.url), { headers: privateHeaders });
  }
  if (!access.ok) return failure(access.status);
  if (!asset) return failure(404);

  try {
    // Only catalogued filenames reach the filesystem; no user-supplied path joins.
    const bytes = await readFile(path.join(process.cwd(), "studio-assets", asset.kind, asset.file));
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        ...privateHeaders,
        "Content-Type": asset.contentType,
        ...(asset.file !== "index.html" ? { "Content-Disposition": `attachment; filename="${asset.file}"` } : {}),
      },
    });
  } catch {
    return failure(503);
  }
}

function failure(status: number) {
  return NextResponse.json({ error: status === 401 ? "Sign in to TrustCode OS to open this document tool." : status === 403 ? "Your account cannot access this document tool." : status === 404 ? "Not found" : "Document tools are temporarily unavailable. Please try again." }, { status, headers: privateHeaders });
}
