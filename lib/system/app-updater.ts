import type { SystemUpdateStatus } from "@/types/admin-dashboard";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const BRANCH = "main";
const DEFAULT_REPO = "Murlidhar08/next-auth-template";

/**
 * Normalizes any GitHub repo string (full URL, git@ URL, or owner/repo) to 'owner/repo'.
 */
export function normalizeRepo(rawInput: string): string {
  const trimmed = rawInput.trim().replace(/^['"]|['"]$/g, "");
  const match = trimmed.match(/github\.com[:/]([^/]+)\/([^/.]+?)(?:\.git)?$/i);
  if (match) {
    return `${match[1]}/${match[2]}`;
  }
  const simpleMatch = trimmed.match(/^([^/]+)\/([^/.]+)$/);
  if (simpleMatch) {
    return `${simpleMatch[1]}/${simpleMatch[2]}`;
  }
  return trimmed.replace(/\.git$/, "");
}

/**
 * Parses a semver string into [major, minor, patch] numbers.
 */
export function parseSemver(v: string): [number, number, number] {
  const clean = v.replace(/^v/, "").trim();
  const parts = clean.split(".").map((n) => parseInt(n, 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

/**
 * Compares two semver strings.
 * Returns: 1 if latest > current, -1 if latest < current, 0 if equal.
 */
export function compareSemver(current: string, latest: string): number {
  const [cMajor, cMinor, cPatch] = parseSemver(current);
  const [lMajor, lMinor, lPatch] = parseSemver(latest);

  if (lMajor !== cMajor) return lMajor > cMajor ? 1 : -1;
  if (lMinor !== cMinor) return lMinor > cMinor ? 1 : -1;
  if (lPatch !== cPatch) return lPatch > cPatch ? 1 : -1;
  return 0;
}

/**
 * Reads local package.json version.
 */
export function getLocalPackageVersion(): string {
  try {
    const pkgPath = resolve(process.cwd(), "package.json");
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      return pkg.version || "0.0.1";
    }
  } catch {
    // fallback
  }
  return "0.0.1";
}

/**
 * Checks GitHub for latest version from Releases, falling back to package.json.
 */
export async function checkForUpdates(): Promise<SystemUpdateStatus> {
  const repo = process.env.GITHUB_REPOSITORY
    ? normalizeRepo(process.env.GITHUB_REPOSITORY)
    : normalizeRepo(DEFAULT_REPO);

  const currentVersion = getLocalPackageVersion();

  const headers: Record<string, string> = {
    "User-Agent": "Next-Template-AutoUpdate/1.0",
    Accept: "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  let latestVersion = currentVersion;
  let releaseTitle: string | undefined;
  let releaseNotes: string | undefined;
  let publishedAt: string | undefined;

  // 1. Check GitHub Latest Release
  try {
    const releaseRes = await fetch(
      `https://api.github.com/repos/${repo}/releases/latest`,
      { headers, next: { revalidate: 300 } }
    );

    if (releaseRes.ok) {
      const release = await releaseRes.json();
      if (release.tag_name) {
        latestVersion = release.tag_name.replace(/^v/, "").trim();
        releaseTitle = release.name || release.tag_name;
        releaseNotes = release.body;
        publishedAt = release.published_at;
      }
    }
  } catch {
    // Release check failed or no releases found
  }

  // 2. Fallback: package.json on target branch if no release available
  if (latestVersion === currentVersion) {
    try {
      const rawPkgRes = await fetch(
        `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(BRANCH)}/package.json`,
        {
          headers: { "User-Agent": "Next-Template-AutoUpdate/1.0" },
          next: { revalidate: 300 },
        }
      );

      if (rawPkgRes.ok) {
        const remotePkg = await rawPkgRes.json();
        if (remotePkg.version) {
          latestVersion = remotePkg.version.replace(/^v/, "").trim();
        }
      }
    } catch {
      // package.json fallback failed
    }
  }

  const hasUpdate = compareSemver(currentVersion, latestVersion) > 0;

  return {
    currentVersion,
    latestVersion,
    hasUpdate,
    publishedAt,
    checkedAt: new Date().toISOString(),
  };
}
