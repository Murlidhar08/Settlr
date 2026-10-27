import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { apiError } from "@/lib/api/response";
import { envServer } from "@/lib/env.server";

export const runtime = "nodejs";

/**
 * Supported color accent palettes for OG image generation
 */
const ACCENT_PALETTES: Record<string, { primary: string; secondary: string; glow: string; text: string }> = {
  indigo: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    glow: "rgba(99, 102, 241, 0.28)",
    text: "#c7d2fe",
  },
  purple: {
    primary: "#a855f7",
    secondary: "#ec4899",
    glow: "rgba(168, 85, 247, 0.28)",
    text: "#e9d5ff",
  },
  blue: {
    primary: "#3b82f6",
    secondary: "#06b6d4",
    glow: "rgba(59, 130, 246, 0.28)",
    text: "#bfdbfe",
  },
  emerald: {
    primary: "#10b981",
    secondary: "#14b8a6",
    glow: "rgba(16, 185, 129, 0.28)",
    text: "#a7f3d0",
  },
  rose: {
    primary: "#f43f5e",
    secondary: "#fb7185",
    glow: "rgba(244, 63, 94, 0.28)",
    text: "#fecdd3",
  },
  amber: {
    primary: "#f59e0b",
    secondary: "#ea580c",
    glow: "rgba(245, 158, 11, 0.28)",
    text: "#fde68a",
  },
  cyan: {
    primary: "#06b6d4",
    secondary: "#3b82f6",
    glow: "rgba(6, 182, 212, 0.28)",
    text: "#a5f3fc",
  },
};

/**
 * Cache for the application logo data URL
 */
let cachedLogoDataUrl: string | null = null;
let logoChecked = false;

function getAppLogoBase64(): string | null {
  if (logoChecked) return cachedLogoDataUrl;
  logoChecked = true;

  try {
    const candidatePaths = [
      path.join(process.cwd(), "public", "images", "logo", "maskable_icon_x192.png"),
      path.join(process.cwd(), "public", "images", "logo", "dark_logo.png"),
      path.join(process.cwd(), "public", "images", "logo", "light_logo.png"),
    ];

    for (const filePath of candidatePaths) {
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        cachedLogoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
        return cachedLogoDataUrl;
      }
    }
  } catch (error) {
    console.warn("[OG Image] Failed to read local logo image:", error);
  }

  return null;
}

/**
 * Parse and validate dimensions
 */
function parseDimensions(
  typeParam: string | null,
  widthParam: string | null,
  heightParam: string | null
): { width: number; height: number; isTwitter: boolean; isSquare: boolean; isBanner: boolean } {
  const normalizedType = (typeParam || "").toLowerCase().trim();

  // Presets:
  // 1. Twitter Banner / Header: 1500 x 500
  // 2. Twitter Square OG: 1500 x 1500
  // 3. Standard OG: 1200 x 630
  let width = 1200;
  let height = 630;
  let isTwitter = false;

  if (
    normalizedType === "twitter-banner" ||
    normalizedType === "twitter_banner" ||
    normalizedType === "banner" ||
    normalizedType === "header" ||
    normalizedType === "twitter" ||
    normalizedType === "x"
  ) {
    width = 1500;
    height = 500;
    isTwitter = true;
  } else if (
    normalizedType === "twitter-og" ||
    normalizedType === "twitter_og" ||
    normalizedType === "twitter-square" ||
    normalizedType === "square"
  ) {
    width = 1500;
    height = 1500;
    isTwitter = true;
  } else if (normalizedType === "og" || normalizedType === "opengraph") {
    width = 1200;
    height = 630;
  }

  // Override width/height if explicitly provided as numbers
  if (widthParam) {
    const parsedWidth = parseInt(widthParam, 10);
    if (!isNaN(parsedWidth) && parsedWidth >= 200 && parsedWidth <= 3000) {
      width = parsedWidth;
    }
  }

  if (heightParam) {
    const parsedHeight = parseInt(heightParam, 10);
    if (!isNaN(parsedHeight) && parsedHeight >= 200 && parsedHeight <= 3000) {
      height = parsedHeight;
    }
  }

  const isSquare = height >= width * 0.82;
  const isBanner = width >= height * 2.2;
  return {
    width,
    height,
    isTwitter: isTwitter || (width === 1500 && (height === 500 || height === 1500)),
    isSquare,
    isBanner,
  };
}

/**
 * GET /api/image
 *
 * Dynamic Open Graph & Social Share Image Generator
 *
 * Query Parameters:
 * - `type` / `preset`: "og" (1200x630, default) | "twitter" / "twitter-banner" (1500x500) | "twitter-og" (1500x1500) | "custom"
 * - `width`: number (200 - 3000)
 * - `height`: number (200 - 3000)
 * - `brand` / `brandName` / `title`: Main brand name / application title
 * - `description` / `appDescription` / `desc`: Application description
 * - `badge` / `tagline`: Optional pill badge text (e.g. "Next.js 16 • React 19")
 * - `theme`: "dark" (default) | "light"
 * - `accent`: "indigo" | "purple" | "blue" | "emerald" | "rose" | "amber" | "cyan" | custom hex
 * - `logo`: "true" (default) | "false"
 * - `domain`: Displayed domain in footer
 * - `tags`: Comma-separated list of tags (e.g. "Better Auth,Prisma,Tailwind")
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract type & dimensions
    const typeParam = searchParams.get("type") || searchParams.get("preset");
    const widthParam = searchParams.get("width");
    const heightParam = searchParams.get("height");
    const { width, height, isSquare, isBanner } = parseDimensions(typeParam, widthParam, heightParam);

    // Extract brand name & description with defaults
    const defaultBrand = envServer.NEXT_PUBLIC_APP_NAME;
    const defaultDescription = envServer.NEXT_PUBLIC_APP_DESCRIPTION;

    const brand = (
      searchParams.get("brand") ||
      searchParams.get("brandName") ||
      searchParams.get("title") ||
      searchParams.get("appName") ||
      defaultBrand
    ).trim();

    const description = (
      searchParams.get("description") ||
      searchParams.get("appDescription") ||
      searchParams.get("desc") ||
      defaultDescription
    ).trim();

    // Extract other customization parameters
    const badge = searchParams.get("badge") || searchParams.get("tagline") || "Next.js 16 • React 19";
    const showBadge = badge !== "none" && badge !== "false" && badge.length > 0;
    const theme = searchParams.get("theme") === "light" ? "light" : "dark";
    const showLogo = searchParams.get("logo") !== "false";

    // Extract accent palette
    const accentParam = (searchParams.get("accent") || "indigo").toLowerCase();
    const accent = ACCENT_PALETTES[accentParam] || {
      primary: accentParam.startsWith("#") ? accentParam : "#6366f1",
      secondary: "#8b5cf6",
      glow: "rgba(99, 102, 241, 0.28)",
      text: "#c7d2fe",
    };

    // Extract domain / URL
    const hostHeader = req.headers.get("host");
    let fallbackDomain = "next-template.dev";
    try {
      if (process.env.BETTER_AUTH_URL) {
        fallbackDomain = new URL(process.env.BETTER_AUTH_URL).hostname;
      } else if (hostHeader) {
        fallbackDomain = hostHeader.split(":")[0];
      }
    } catch {
      // Ignore URL parsing fallback
    }
    const domain = searchParams.get("domain") || searchParams.get("url") || fallbackDomain;

    // Extract optional tags
    const tagsParam = searchParams.get("tags") || searchParams.get("features");
    const tags = tagsParam
      ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean)
      : ["Better Auth", "Prisma 7", "Tailwind 4", "TypeScript"];

    // Retrieve application logo base64 if enabled
    const logoDataUrl = showLogo ? getAppLogoBase64() : null;

    // Calculate dynamic scaling for typography based on canvas size
    const isDark = theme === "dark";
    const bgBase = isDark ? "#08090f" : "#f8fafc";
    const cardBg = isDark ? "rgba(15, 23, 42, 0.65)" : "rgba(255, 255, 255, 0.85)";
    const cardBorder = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
    const textPrimary = isDark ? "#ffffff" : "#0f172a";
    const textSecondary = isDark ? "#94a3b8" : "#475569";
    const textMuted = isDark ? "#64748b" : "#94a3b8";

    // Base scale factors
    const scaleFactor = isSquare
      ? Math.min(width / 1500, height / 1500)
      : isBanner
        ? Math.min(width / 1500, height / 500)
        : Math.min(width / 1200, height / 630);

    // Responsive font sizes & spacings
    const brandFontSize = Math.round(
      Math.max(28, (isSquare ? 76 : isBanner ? 50 : 56) * scaleFactor)
    );
    const descFontSize = Math.round(
      Math.max(16, (isSquare ? 34 : isBanner ? 22 : 24) * scaleFactor)
    );
    const badgeFontSize = Math.round(
      Math.max(13, (isSquare ? 20 : isBanner ? 15 : 16) * scaleFactor)
    );
    const domainFontSize = Math.round(
      Math.max(13, (isSquare ? 22 : isBanner ? 16 : 18) * scaleFactor)
    );
    const cardPadding = Math.round(
      Math.max(24, (isSquare ? 68 : isBanner ? 36 : 48) * scaleFactor)
    );
    const cardMargin = Math.round(
      Math.max(16, (isSquare ? 56 : isBanner ? 24 : 36) * scaleFactor)
    );
    const logoSize = Math.round(
      Math.max(36, (isSquare ? 110 : isBanner ? 48 : 54) * scaleFactor)
    );

    // Render JSX image template
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: bgBase,
            position: "relative",
            overflow: "hidden",
            fontFamily: "sans-serif",
            padding: `${cardMargin}px`,
          }}
        >
          {/* Ambient Background Glows */}
          <div
            style={{
              position: "absolute",
              top: "-10%",
              left: "-10%",
              width: "55%",
              height: "55%",
              borderRadius: "9999px",
              background: `radial-gradient(circle, ${accent.glow} 0%, transparent 70%)`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-10%",
              right: "-10%",
              width: "60%",
              height: "60%",
              borderRadius: "9999px",
              background: `radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, transparent 70%)`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "40%",
              right: "20%",
              width: "40%",
              height: "40%",
              borderRadius: "9999px",
              background: `radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)`,
              display: "flex",
            }}
          />

          {/* Main Glassmorphism Card */}
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: isSquare ? "center" : "stretch",
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: `${Math.round(28 * scaleFactor)}px`,
              padding: `${cardPadding}px`,
              boxShadow: isDark
                ? "0 30px 60px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                : "0 25px 50px -12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
              position: "relative",
            }}
          >
            {/* Top Bar / Header Section */}
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: isSquare ? "center" : "space-between",
              }}
            >
              {!isSquare ? (
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {showLogo && (
                    <div
                      style={{
                        width: `${logoSize}px`,
                        height: `${logoSize}px`,
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`,
                        boxShadow: `0 8px 24px -4px ${accent.glow}`,
                        padding: "3px",
                      }}
                    >
                      {logoDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoDataUrl}
                          alt="Logo"
                          width={logoSize - 6}
                          height={logoSize - 6}
                          style={{ borderRadius: "11px", objectFit: "contain" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "11px",
                            backgroundColor: "#0f172a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            fontSize: `${Math.round(logoSize * 0.48)}px`,
                            fontWeight: 900,
                          }}
                        >
                          {brand.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  <span
                    style={{
                      fontSize: `${Math.round(24 * scaleFactor)}px`,
                      fontWeight: 700,
                      color: textPrimary,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {brand}
                  </span>
                </div>
              ) : null}

              {/* Tagline / Badge */}
              {showBadge && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: `${Math.round(8 * scaleFactor)}px ${Math.round(20 * scaleFactor)}px`,
                    borderRadius: "9999px",
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
                    border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)"}`,
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "9999px",
                      backgroundColor: accent.primary,
                      boxShadow: `0 0 10px ${accent.primary}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: `${badgeFontSize}px`,
                      fontWeight: 600,
                      color: isDark ? accent.text : accent.primary,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {badge}
                  </span>
                </div>
              )}
            </div>

            {/* Middle Content Section */}
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: isSquare ? "center" : "flex-start",
                textAlign: isSquare ? "center" : "left",
                marginTop: isSquare ? "auto" : "0",
                marginBottom: isSquare ? "auto" : "0",
                gap: `${Math.round((isBanner ? 10 : 18) * scaleFactor)}px`,
              }}
            >
              {/* Large Central Logo for Square / Twitter OG */}
              {isSquare && showLogo && (
                <div
                  style={{
                    width: `${logoSize}px`,
                    height: `${logoSize}px`,
                    borderRadius: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`,
                    boxShadow: `0 16px 40px -8px ${accent.glow}`,
                    padding: "6px",
                    marginBottom: `${Math.round(12 * scaleFactor)}px`,
                  }}
                >
                  {logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoDataUrl}
                      alt="Logo"
                      width={logoSize - 12}
                      height={logoSize - 12}
                      style={{ borderRadius: "22px", objectFit: "contain" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "22px",
                        backgroundColor: "#0f172a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontSize: `${Math.round(logoSize * 0.45)}px`,
                        fontWeight: 900,
                      }}
                    >
                      {brand.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}

              {/* Main Brand Title */}
              <div
                style={{
                  fontSize: `${brandFontSize}px`,
                  fontWeight: 900,
                  letterSpacing: "-0.035em",
                  lineHeight: 1.12,
                  color: textPrimary,
                  maxWidth: isSquare ? "92%" : "95%",
                }}
              >
                {brand}
              </div>

              {/* Accent Line Divider (Square format) */}
              {isSquare && (
                <div
                  style={{
                    width: `${Math.round(120 * scaleFactor)}px`,
                    height: "5px",
                    borderRadius: "9999px",
                    background: `linear-gradient(90deg, ${accent.primary}, ${accent.secondary})`,
                    marginTop: "6px",
                    marginBottom: "8px",
                  }}
                />
              )}

              {/* Application Description */}
              <div
                style={{
                  fontSize: `${descFontSize}px`,
                  lineHeight: 1.48,
                  color: textSecondary,
                  maxWidth: isSquare ? "88%" : "85%",
                  fontWeight: 400,
                }}
              >
                {description}
              </div>

              {/* Feature Badges for Square / Twitter OG */}
              {isSquare && tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: `${Math.round(14 * scaleFactor)}px`,
                    marginTop: `${Math.round(20 * scaleFactor)}px`,
                  }}
                >
                  {tags.map((tag, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: `${Math.round(10 * scaleFactor)}px ${Math.round(24 * scaleFactor)}px`,
                        borderRadius: "9999px",
                        backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                        border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)"}`,
                        fontSize: `${Math.round(20 * scaleFactor)}px`,
                        fontWeight: 600,
                        color: textPrimary,
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Metadata Bar */}
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: isSquare ? "center" : "space-between",
                paddingTop: `${Math.round((isBanner ? 12 : 20) * scaleFactor)}px`,
                borderTop: `1px solid ${isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.06)"}`,
              }}
            >
              {/* Domain / Website URL */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "9999px",
                    backgroundColor: "#10b981",
                    boxShadow: "0 0 10px #10b981",
                  }}
                />
                <span
                  style={{
                    fontSize: `${domainFontSize}px`,
                    fontWeight: 600,
                    color: textMuted,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {domain}
                </span>
              </div>

              {/* Tags in Horizontal Banner Layout */}
              {!isSquare && tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {tags.slice(0, 3).map((tag, i) => (
                    <div
                      key={i}
                      style={{
                        padding: `${Math.round(6 * scaleFactor)}px ${Math.round(16 * scaleFactor)}px`,
                        borderRadius: "8px",
                        backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)",
                        border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"}`,
                        fontSize: `${Math.round(15 * scaleFactor)}px`,
                        fontWeight: 500,
                        color: textSecondary,
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      {
        width,
        height,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch (error) {
    console.error("[OG Image Generator Error]:", error);
    return apiError(error, 500);
  }
}
