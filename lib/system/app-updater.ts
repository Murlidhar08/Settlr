import type { ApplyUpdateResult, SystemUpdateStatus } from "@/types/admin-dashboard";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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
 * Extracts GitHub owner/repo from git remote origin URL.
 */
export function getGitRemoteRepo(): string | null {
  try {
    const remoteUrl = execSync("git remote get-url origin", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();

    const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
  } catch {
    // Non-git or no origin remote
  }
  return null;
}

/**
 * Gets the current active git branch name.
 */
export function getCurrentBranch(): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
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
  const repo =
    options?.repo ||
    process.env.GITHUB_REPOSITORY ||
    getGitRemoteRepo() ||
    "Murlidhar08/next-template";
  const branch = options?.branch || getCurrentBranch();
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
  let latestCommit = "";

  // 1. Check GitHub latest release first
  try {
    const releaseRes = await fetch(
      `https://api.github.com/repos/${repo}/releases/latest`,
      { headers, next: { revalidate: 60 } }
    );
    if (releaseRes.ok) {
      const releaseData = await releaseRes.json();
      if (releaseData.tag_name) {
        latestVersion = releaseData.tag_name.replace(/^v/, "");
        releaseTitle = releaseData.name || releaseData.tag_name;
        releaseNotes = releaseData.body;
        publishedAt = releaseData.published_at;
      }
    }
  } catch {
    // Ignore and fallback
  }

  // 2. If no release found, fetch remote package.json from raw GitHub
  if (latestVersion === currentVersion) {
    try {
      const rawPkgRes = await fetch(
        `https://raw.githubusercontent.com/${repo}/${branch}/package.json`,
        { headers: { "User-Agent": headers["User-Agent"] }, next: { revalidate: 60 } }
      );
      if (rawPkgRes.ok) {
        const rawPkg = await rawPkgRes.json();
        if (rawPkg.version) {
          latestVersion = rawPkg.version;
        }
      }
    } catch {
      // Ignore
    }
  }

  // 3. Fetch latest commit SHA on the target branch
  try {
    const commitRes = await fetch(
      `https://api.github.com/repos/${repo}/commits/${branch}`,
      { headers, next: { revalidate: 60 } }
    );
    if (commitRes.ok) {
      const commitData = await commitRes.json();
      if (commitData.sha) {
        latestCommit = commitData.sha.slice(0, 7);
        if (!releaseTitle && commitData.commit?.message) {
          releaseTitle = commitData.commit.message.split("\n")[0];
        }
      }
    }
  } catch {
    // Ignore
  }

  const hasVersionUpdate = compareSemver(currentVersion, latestVersion) > 0;
  const hasCommitUpdate = Boolean(latestCommit && latestCommit !== currentCommit);
  const hasUpdate = hasVersionUpdate || hasCommitUpdate;

  return {
    repo,
    branch,
    currentVersion,
    latestVersion,
    currentCommit,
    latestCommit: latestCommit || currentCommit,
    hasVersionUpdate,
    hasCommitUpdate,
    hasUpdate,
    releaseTitle,
    releaseNotes,
    publishedAt,
    lastCheckedAt: new Date().toISOString(),
  };
}

/**
 * Runs a command and captures its output into the logs list.
 */
function runStep(cmd: string, stepName: string, logs: string[]): string {
  logs.push(`► [${stepName}] Starting: ${cmd}`);
  try {
    const output = execSync(cmd, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 180000, // 3 minutes timeout per step
    }).trim();
    if (output) {
      logs.push(output);
    }
    logs.push(`✔ [${stepName}] Completed successfully.`);
    return output;
  } catch (err: unknown) {
    const execErr = err as { stdout?: string; stderr?: string; message?: string };
    const errOutput = (execErr.stderr || execErr.stdout || execErr.message || String(err)).trim();
    logs.push(`✖ [${stepName}] Failed: ${errOutput}`);
    throw new Error(`Step '${stepName}' failed: ${errOutput}`);
  }
}

/**
 * Applies the application update directly on the server.
 */
export async function applyAppUpdate(options?: {
  branch?: string;
  stash?: boolean;
  skipInstall?: boolean;
  skipPrisma?: boolean;
}): Promise<ApplyUpdateResult> {
  const previousVersion = getLocalPackageVersion();
  const previousCommit = getCurrentCommit();
  const branch = options?.branch || getCurrentBranch();
  const logs: string[] = [];

  logs.push(`Initiating application update on branch '${branch}'...`);
  logs.push(`Current state: v${previousVersion} (${previousCommit})`);

  let hasStashed = false;

  // 1. Check working directory for uncommitted changes
  try {
    const status = execSync("git status --porcelain", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();

    if (status.length > 0) {
      logs.push(`Found uncommitted local changes:\n${status}`);
      logs.push("Stashing local changes before pulling...");
      execSync(`git stash push -m "Auto-updater stash before app update - ${Date.now()}"`, {
        stdio: ["pipe", "pipe", "ignore"],
      });
      hasStashed = true;
      logs.push("✔ Stashed uncommitted changes.");
    }
  } catch {
    // Continue
  }

  try {
    // 2. Git pull
    runStep(`git pull origin ${branch}`, "Git Pull", logs);

    // 3. Install npm dependencies
    if (!options?.skipInstall) {
      runStep("npm install", "Dependency Sync", logs);
    }

    // 4. Generate Prisma Client
    if (!options?.skipPrisma) {
      runStep("npx prisma generate", "Prisma Client Generate", logs);

      // Deploy migrations if needed (non-fatal if no migrations or already up to date)
      try {
        runStep("npx prisma migrate deploy", "Prisma Migrations", logs);
      } catch (migrateErr) {
        logs.push(`ℹ Prisma migration notice: ${migrateErr instanceof Error ? migrateErr.message : String(migrateErr)}`);
      }
    }

    // 5. Restore stash if previously stashed
    if (hasStashed) {
      logs.push("Restoring previously stashed local changes...");
      try {
        execSync("git stash pop", {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "ignore"],
        });
        logs.push("✔ Stashed changes successfully restored.");
      } catch {
        logs.push("⚠ Notice: Merge conflict while popping stash. Your stashed files remain in 'git stash list'.");
      }
    }

    const updatedVersion = getLocalPackageVersion();
    const updatedCommit = getCurrentCommit();

    logs.push(`✔ Application update finalized: v${updatedVersion} (${updatedCommit})`);

    return {
      success: true,
      previousVersion,
      updatedVersion,
      previousCommit,
      updatedCommit,
      logs,
      message: `Updated successfully from v${previousVersion} (${previousCommit}) to v${updatedVersion} (${updatedCommit})`,
    };
  } catch (err) {
    if (hasStashed) {
      try {
        execSync("git stash pop", {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "ignore"],
        });
        logs.push("Restored stash after update failure.");
      } catch {
        logs.push("Could not automatically restore stash. Stash remains available in 'git stash list'.");
      }
    }

    const errorMsg = err instanceof Error ? err.message : String(err);
    logs.push(`✖ Update terminated with error: ${errorMsg}`);

    return {
      success: false,
      previousVersion,
      updatedVersion: getLocalPackageVersion(),
      previousCommit,
      updatedCommit: getCurrentCommit(),
      logs,
      message: errorMsg,
    };
  }
}
