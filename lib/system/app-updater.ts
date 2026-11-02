import type { SystemUpdateStatus } from "@/types/admin-dashboard";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const VALID_BRANCH_REGEX = /^[a-zA-Z0-9._/-]+$/;

/**
 * Parses semver string into [major, minor, patch] numbers.
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
 * Normalizes any GitHub repo string (full URL, git@ URL, or owner/repo) to 'owner/repo'.
 */
export function normalizeRepo(rawInput?: string | null): string {
  if (!rawInput) return "Murlidhar08/next-template";
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
 * Extracts GitHub owner/repo from git remote origin URL.
 */
export function getGitRemoteRepo(): string | null {
  try {
    const remoteUrl = execSync("git remote get-url origin", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();

    return normalizeRepo(remoteUrl);
  } catch {
    // Non-git or no origin remote
  }
  return null;
}

/**
 * Gets the current active git branch name with regex validation.
 */
export function getCurrentBranch(): string {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    if (!/^[a-zA-Z0-9._/-]+$/.test(branch)) {
      throw new Error("Invalid git branch format");
    }
    return branch;

    if (!VALID_BRANCH_REGEX.test(branch)) {
      throw new Error("Invalid git branch format");
    }
    return branch;
  } catch {
    return "main";
  }
}

/**
 * Gets the current commit short hash.
 */
export function getCurrentCommit(): string {
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

/**
 * Reads local package.json version.
 */
export function getLocalPackageVersion(): string {
  try {
    const pkgPath = resolve(process.cwd(), "package.json");
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      return pkg.version || "0.0.0";
    }
  } catch {
    // fallback
  }
  return "0.0.0";
}

/**
 * Checks GitHub for latest releases, tags, raw package.json version, and latest commit.
 */
export async function checkForUpdates(options?: {
  repo?: string;
  branch?: string;
}): Promise<SystemUpdateStatus> {
  const rawRepo =
    options?.repo ||
    getGitRemoteRepo() ||
    process.env.GITHUB_REPOSITORY ||
    "Murlidhar08/next-template";
  const repo = normalizeRepo(rawRepo);
  const branch = options?.branch || getCurrentBranch();
  if (!/^[a-zA-Z0-9._/-]+$/.test(branch)) {
    throw new Error("Invalid git branch format");
  }

  if (!VALID_BRANCH_REGEX.test(branch)) {
    throw new Error("Invalid git branch name");
  }

  const currentVersion = getLocalPackageVersion();
  const currentCommit = getCurrentCommit();

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
  let latestCommit: string | undefined;

  // 1. Check GitHub Releases
  try {
    const releasesRes = await fetch(
      `https://api.github.com/repos/${repo}/releases/latest`,
      { headers, next: { revalidate: 300 } }
    );

    if (releasesRes.ok) {
      const release = await releasesRes.json();
      if (release.tag_name) {
        latestVersion = release.tag_name.replace(/^v/, "").trim();
        releaseTitle = release.name || release.tag_name;
        releaseNotes = release.body;
        publishedAt = release.published_at;
      }
    }
  } catch {
    // Continue
  }

  // 2. Check tags if no release found
  if (latestVersion === currentVersion) {
    try {
      const tagsRes = await fetch(
        `https://api.github.com/repos/${repo}/tags?per_page=1`,
        { headers, next: { revalidate: 300 } }
      );

      if (tagsRes.ok) {
        const tags = await tagsRes.json();
        if (Array.isArray(tags) && tags.length > 0 && tags[0]?.name) {
          latestVersion = tags[0].name.replace(/^v/, "").trim();
        }
      }
    } catch {
      // Continue
    }
  }

  // 3. Fallback: package.json on target branch
  if (latestVersion === currentVersion) {
    try {
      const rawPkgRes = await fetch(
        `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(branch)}/package.json`,
        { headers: { "User-Agent": "Next-Template-AutoUpdate/1.0" }, next: { revalidate: 300 } }
      );

      if (rawPkgRes.ok) {
        const remotePkg = await rawPkgRes.json();
        if (remotePkg.version) {
          latestVersion = remotePkg.version;
        }
      }
    } catch {
      // Continue
    }
  }

  // 4. Check latest commit SHA on target branch
  try {
    const branchRes = await fetch(
      `https://api.github.com/repos/${repo}/commits/${encodeURIComponent(branch)}`,
      { headers, next: { revalidate: 300 } }
    );

    if (branchRes.ok) {
      const commitData = await branchRes.json();
      if (commitData?.sha) {
        latestCommit = commitData.sha.substring(0, 7);
        if (!publishedAt && commitData?.commit?.committer?.date) {
          publishedAt = commitData.commit.committer.date;
        }
      }
    }
  } catch {
    // Continue
  }

  const semverComparison = compareSemver(currentVersion, latestVersion);
  const hasVersionUpdate = semverComparison > 0;
  const hasCommitUpdate =
    Boolean(latestCommit) &&
    currentCommit !== "unknown" &&
    latestCommit !== currentCommit;
  const hasUpdate = hasVersionUpdate || hasCommitUpdate;
  const updateAvailable = hasUpdate;

  return {
    currentVersion,
    latestVersion,
    currentCommit,
    updateAvailable,
    hasVersionUpdate,
    hasCommitUpdate,
    hasUpdate,
    branch,
    repo,
    releaseNotes,
    releaseTitle,
    publishedAt,
    checkedAt: new Date().toISOString(),
  };
}
