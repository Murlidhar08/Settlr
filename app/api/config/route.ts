import { NextResponse } from "next/server";
import { getPublicRuntimeConfig } from "@/lib/config/runtime";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Centralized Runtime Configuration API
 *
 * Returns client-safe public environment variables loaded dynamically at runtime.
 * Sensitive server credentials and database connection strings are never exposed.
 */
export async function GET() {
  const config = getPublicRuntimeConfig();

  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
