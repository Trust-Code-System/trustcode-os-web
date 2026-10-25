import { NextRequest, NextResponse } from "next/server";
import { GET as serveStudio } from "@/app/api/studios/[...resource]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const response = await serveStudio(request, { params: Promise.resolve({ resource: ["contract", "index.html"] }) });
  return response.status === 401
    ? NextResponse.redirect(new URL("/login?returnTo=%2Fdocuments%2Fcontracts", request.url), { headers: { "Cache-Control": "private, no-store" } })
    : response;
}
