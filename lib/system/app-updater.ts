import type { ApplyUpdateResult, SystemUpdateStatus } from "@/types/admin-dashboard";
import { execSync, spawn } from "node:child_process";
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

/**
 * Runs a shell step synchronously and appends output to updater execution log.
 */
function runStep(command: string, stepName: string, logs: string[]): string {
  logs.push(`► [${stepName}] Executing: ${command}`);
  try {
    const output = execSync(command, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 180000, // 3 minutes timeout
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
 * Schedules a graceful server restart.
 * Waits for the current HTTP response to finish before triggering restart/exit.
 */
export function scheduleServerRestart(delayMs = 2000): void {
  setTimeout(() => {
    console.log("[App Updater] Executing graceful server restart...");

    // 1. PM2 environment
    if (process.env.pm_id !== undefined) {
      console.log("[App Updater] PM2 process detected. Exiting process for PM2 manager restart...");
      process.exit(0);
    }

    // 2. Docker / Container environment (PID 1 or container env)
    if (existsSync("/.dockerenv")) {
      console.log("[App Updater] Docker container detected. Exiting process for container restart...");
      process.exit(0);
    }

    // 3. Fallback: Spawn new process and exit current
    try {
      const isWindows = process.platform === "win32";
      const cmd = isWindows ? "cmd.exe" : "npm";
      const args = isWindows ? ["/c", "npm", "start"] : ["start"];

      const child = spawn(cmd, args, {
        detached: true,
        stdio: "ignore",
        shell: isWindows,
        cwd: process.cwd(),
        env: process.env,
      });
      child.unref();
      process.exit(0);
    } catch (spawnErr) {
      console.warn("[App Updater] Could not spawn new process, exiting cleanly:", spawnErr);
      process.exit(0);
    }
  }, delayMs);
}

/**
 * Applies the application update directly on the server.
 */
export async function applyAppUpdate(options?: {
  branch?: string;
  stash?: boolean;
  skipInstall?: boolean;
  skipPrisma?: boolean;
  restart?: boolean;
}): Promise<ApplyUpdateResult> {
  const previousVersion = getLocalPackageVersion();
  const previousCommit = getCurrentCommit();
  const branch = options?.branch || getCurrentBranch();
  if (!/^[a-zA-Z0-9._/-]+$/.test(branch)) {
    throw new Error("Invalid git branch format");
  }

  // Validate git branch to prevent command injection
  if (!VALID_BRANCH_REGEX.test(branch)) {
    throw new Error("Invalid git branch format");
  }

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
    // 2. Git pull safely with validated branch
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

    const shouldRestart = options?.restart !== false;
    if (shouldRestart) {
      logs.push("► Application restart scheduled in 2 seconds...");
      scheduleServerRestart(2000);
    }

    return {
      success: true,
      previousVersion,
      updatedVersion,
      previousCommit,
      updatedCommit,
      logs,
      message: `Updated successfully from v${previousVersion} (${previousCommit}) to v${updatedVersion} (${updatedCommit})`,
      restarting: shouldRestart,
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
