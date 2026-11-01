import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security headers applied to responses to prevent common web attacks:
 * - Clickjacking (X-Frame-Options)
 * - MIME-type confusion (X-Content-Type-Options)
 * - Referrer leakage (Referrer-Policy)
 * - Browser feature restrictions (Permissions-Policy)
 * - HSTS (Strict-Transport-Security)
 * - Content Security Policy (CSP)
 */
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://lh3.googleusercontent.com https://cdn.discordapp.com; connect-src 'self' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com; object-src 'none'; base-uri 'self';",
};

/**
 * Escapes regex special characters and translates wildcard patterns safely.
 */
function wildcardToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`);
}

/**
 * Validates Origin/Referer header on state-changing API requests to prevent CSRF/XSRF attacks.
 */
function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  if (!host) return false;

  const allowedOrigins = [
    `http://${host}`,
    `https://${host}`,
    process.env.BETTER_AUTH_URL,
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",") : []),
  ].filter(Boolean) as string[];

  const matchesAllowed = (candidate: string) => {
    return allowedOrigins.some((allowed) => {
      if (allowed.includes("*")) {
        return wildcardToRegex(allowed).test(candidate);
      }
      return candidate === allowed;
    });
  };

  // If Origin header is present, check against allowed list
  if (origin) {
    return matchesAllowed(origin);
  }

  // If Referer is present instead, ensure it matches an allowed origin
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return matchesAllowed(refererOrigin);
    } catch {
      return false;
    }
  }

  // Fail closed for mutating state-changing methods without origin or referer
  return false;
}

/**
 * Next.js 16 proxy convention (replaces deprecated middleware convention).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // 1. CSRF / Origin verification on state-changing API requests
  const isMutatingMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const isApiRoute = pathname.startsWith("/api");
  const isAuthRoute = pathname.startsWith("/api/auth"); // Handled internally with Better Auth

  if (isApiRoute && !isAuthRoute && isMutatingMethod) {
    if (!isValidOrigin(request)) {
      console.warn(
        `[Security] Blocked potential CSRF request from origin: ${
          request.headers.get("origin") || request.headers.get("referer")
        } on ${pathname}`
      );
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Forbidden: Invalid or missing cross-origin request header",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 2. Pass current pathname to Server Components via request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 3. Inject Security Headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Backwards-compatibility alias
export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (.svg, .png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
