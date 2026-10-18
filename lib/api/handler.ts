import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/auth";
import { UnauthorizedError } from "@/lib/errors/app-error";
import { apiError } from "./response";

export interface ApiHandlerContext {
  params?: Promise<Record<string, string | string[]>>;
}

export interface ApiHandlerOptions {
  requireAuth?: boolean;
}

/**
 * Creates a robust, production-ready API route handler wrapper with automatic:
 * - Session checking (optional)
 * - Error catching and normalization
 * - Standardized JSON envelope
 */
export function createApiHandler<T>(
  handler: (
    req: NextRequest,
    ctx: { session: any; params: Record<string, string | string[]> }
  ) => Promise<NextResponse<T> | Response>,
  options: ApiHandlerOptions = {}
) {
  return async (req: NextRequest, rawCtx?: ApiHandlerContext) => {
    try {
      const session = await getServerSession();

      if (options.requireAuth && !session?.user) {
        throw new UnauthorizedError("You must be authenticated to access this endpoint");
      }

      const resolvedParams = rawCtx?.params ? await rawCtx.params : {};

      return await handler(req, {
        session,
        params: resolvedParams as Record<string, string | string[]>,
      });
    } catch (error) {
      console.error(`[API Error] ${req.method} ${req.nextUrl.pathname}:`, error);
      return apiError(error);
    }
  };
}
