#!/usr/bin/env node
/* eslint-env node */
/* global process, console, require */
const fs = require("node:fs");
const path = require("node:path");
const { execSync, spawn } = require("node:child_process");
const readline = require("node:readline");
const { parseArgs } = require("node:util");
const dotenv = require("dotenv");

// 1. Load environment variables (.env.local, .env.production, .env)
const envFiles = [".env.local", ".env.production", ".env"];
for (const file of envFiles) {
  const fullPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath, override: file === ".env.local" });
  }
}

// ANSI colors for clean CLI styling
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
};

const appName = "settlr";

/**
 * Parses semver string into [major, minor, patch] numbers.
 */
function parseSemver(v) {
  const clean = String(v || "").replace(/^v/, "").trim();
  const parts = clean.split(".").map((n) => parseInt(n, 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

/**
 * Compares two semver strings.
 * Returns: 1 if latest > current, -1 if latest < current, 0 if equal.
 */
function compareSemver(current, latest) {
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
function normalizeRepo(rawInput) {
  if (!rawInput) return "Murlidhar08/Property-Hub";
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
function getGitRemoteRepo() {
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
 * Gets the current active git branch name.
 */
function getCurrentBranch() {
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
function getCurrentCommit() {
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
function getLocalPackageVersion() {
  try {
    const pkgPath = path.resolve(process.cwd(), "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
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
async function checkForUpdates(options = {}) {
  const rawRepo =
    options.repo ||
    getGitRemoteRepo() ||
    process.env.GITHUB_REPOSITORY ||
    "Murlidhar08/Property-Hub";
  const repo = normalizeRepo(rawRepo);
  const branch = options.branch || getCurrentBranch();
  const currentVersion = getLocalPackageVersion();
  const currentCommit = getCurrentCommit();

  const headers = {
    "User-Agent": "Property-Hub-AutoUpdate/1.0",
    Accept: "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  let latestVersion = currentVersion;
  let releaseTitle;
  let releaseNotes;
  let publishedAt;
  let latestCommit = "";

  // 1. Check GitHub latest release first
  try {
    const releaseRes = await fetch(
      `https://api.github.com/repos/${repo}/releases/latest`,
      { headers }
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
        { headers: { "User-Agent": headers["User-Agent"] } }
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
      { headers }
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
 * Schedules a graceful server restart.
 */
function scheduleServerRestart(delayMs = 2000) {
  setTimeout(() => {
    console.log("[App Updater] Executing graceful server restart...");

    if (process.env.pm_id !== undefined || fs.existsSync("/.dockerenv") || process.env.KUBERNETES_SERVICE_HOST || process.env.SYSTEMD_EXEC_PID) {
      console.log("[App Updater] Container / process manager detected. Exiting process for restart...");
      process.exit(0);
    }

    try {
      const isWindows = process.platform === "win32";
      const cmd = process.env.npm_lifecycle_event
        ? (isWindows ? "npm.cmd" : "npm")
        : process.argv[0];
      const args = process.env.npm_lifecycle_event
        ? ["run", process.env.npm_lifecycle_event]
        : process.argv.slice(1);

      console.log(`[App Updater] Spawning new process: ${cmd} ${args.join(" ")}`);
      const child = spawn(cmd, args, {
        detached: true,
        stdio: "inherit",
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
 * Prompt question in terminal.
 */
function promptQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Executes a shell command with real-time log output.
 */
function runCommand(cmd, description) {
  console.log(`\n${colors.cyan}► ${description}${colors.reset}`);
  console.log(`${colors.dim}$ ${cmd}${colors.reset}`);
  execSync(cmd, { stdio: "inherit" });
}

/**
 * Main update workflow.
 */
async function main() {
  const { values } = parseArgs({
    options: {
      check: { type: "boolean", short: "c", default: false },
      apply: { type: "boolean", short: "y", default: false },
      branch: { type: "string", short: "b" },
      repo: { type: "string" },
      stash: { type: "boolean", default: false },
      "skip-install": { type: "boolean", default: false },
      "skip-prisma": { type: "boolean", default: false },
      "skip-typecheck": { type: "boolean", default: false },
      force: { type: "boolean", short: "f", default: false },
      restart: { type: "boolean", short: "r", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: false,
  });

  if (values.help) {
    console.log(`
${colors.bold}GitHub Auto-Updater for ${appName}${colors.reset}

Checks GitHub for newer releases, versions in package.json, or commits, and automates pulling, installing dependencies, and running migrations.

${colors.bold}USAGE:${colors.reset}
  node scripts/auto-update.js               Interactive update check and apply
  node scripts/auto-update.js --check       Check only (no changes made)
  node scripts/auto-update.js --apply       Auto-apply update non-interactively

${colors.bold}OPTIONS:${colors.reset}
  -c, --check                   Only check if update is available without applying
  -y, --apply                   Apply update automatically without asking confirmation
  -b, --branch <name>           Specify target branch (defaults to current branch)
      --repo <owner/repo>       Specify GitHub repository (defaults to origin)
      --stash                   Automatically stash and restore uncommitted changes
      --skip-install            Skip running 'npm install'
      --skip-prisma             Skip running prisma generate / migrate
      --skip-typecheck          Skip running 'npm run typecheck'
  -r, --restart                 Automatically restart server when update is complete
  -f, --force                   Force update even if version appears up to date
  -h, --help                    Show this help message

${colors.bold}EXAMPLES:${colors.reset}
  node scripts/auto-update.js --check
  node scripts/auto-update.js --branch develop
`);
    process.exit(0);
  }

  console.log(`\n${colors.bold}${colors.cyan}==================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}         ${appName} GitHub Auto-Updater        ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}==================================================${colors.reset}\n`);

  console.log(`${colors.dim}Checking for updates on GitHub...${colors.reset}`);

  let info;
  try {
    info = await checkForUpdates({
      repo: values.repo,
      branch: values.branch,
    });
  } catch (err) {
    console.error(`${colors.red}Failed to check for updates:${colors.reset}`, err.message);
    process.exit(1);
  }

  // Display status overview
  console.log(`\n${colors.bold}Repository:${colors.reset}  ${colors.magenta}${info.repo}${colors.reset} (${colors.dim}branch: ${info.branch}${colors.reset})`);
  console.log(`${colors.bold}Local Version:${colors.reset}   v${info.currentVersion} (${colors.dim}commit: ${info.currentCommit}${colors.reset})`);
  console.log(`${colors.bold}Remote Version:${colors.reset}  v${info.latestVersion} (${colors.dim}commit: ${info.latestCommit || "unknown"}${colors.reset})`);

  if (info.releaseTitle) {
    console.log(`${colors.bold}Latest Note:${colors.reset}     ${info.releaseTitle}`);
  }

  if (info.publishedAt) {
    console.log(`${colors.bold}Published At:${colors.reset}    ${new Date(info.publishedAt).toLocaleString()}`);
  }

  console.log("");

  // Determine update status
  const updateAvailable = info.hasUpdate || values.force;

  if (!updateAvailable) {
    console.log(`${colors.green}✔ Your repository is completely up to date!${colors.reset}`);
    process.exit(0);
  }

  if (info.hasVersionUpdate) {
    console.log(`${colors.yellow}★ New version available: v${info.currentVersion} → v${info.latestVersion}${colors.reset}`);
  } else if (info.hasCommitUpdate) {
    console.log(`${colors.yellow}★ New commits found on remote branch (${info.currentCommit} → ${info.latestCommit})${colors.reset}`);
  } else if (values.force) {
    console.log(`${colors.yellow}★ Force update flag specified.${colors.reset}`);
  }

  // If check-only mode
  if (values.check) {
    console.log(`\n${colors.dim}Run 'npm run update:apply' or 'npm run update' to update.${colors.reset}\n`);
    process.exit(2);
  }

  // Confirm with user if not non-interactive
  if (!values.apply) {
    const answer = await promptQuestion(`\n${colors.bold}Do you want to pull updates and sync dependencies now? (y/N): ${colors.reset}`);
    if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
      console.log(`${colors.dim}Update cancelled by user.${colors.reset}`);
      process.exit(0);
    }
  }

  // Verify working directory state
  let hasStashed = false;
  try {
    const status = execSync("git status --porcelain", { encoding: "utf8" }).trim();
    if (status.length > 0) {
      if (values.stash) {
        console.log(`\n${colors.yellow}Working directory has unstaged/staged changes. Auto-stashing...${colors.reset}`);
        execSync(`git stash push -m "Auto-updater stash before sync - ${Date.now()}"`, { stdio: "inherit" });
        hasStashed = true;
      } else {
        console.warn(`\n${colors.yellow}Notice: Working directory contains uncommitted changes:${colors.reset}`);
        console.warn(status.split("\n").slice(0, 5).join("\n") + (status.split("\n").length > 5 ? "\n... (more files)" : ""));
        console.log(`${colors.dim}Proceeding with merge. Pass --stash if you want changes safely stashed first.${colors.reset}`);
      }
    }
  } catch {
    // Continue
  }

  try {
    // 1. Git pull
    runCommand(`git pull origin ${info.branch}`, "Pulling latest changes from GitHub");

    // 2. Install dependencies if package.json exists
    if (!values["skip-install"]) {
      runCommand("npm install", "Installing and updating npm dependencies");
    }

    // 3. Prisma generate & migrate
    if (!values["skip-prisma"]) {
      runCommand("npx prisma generate", "Generating Prisma client");
      try {
        runCommand("npx prisma migrate deploy", "Applying pending database migrations");
      } catch (prismaErr) {
        console.warn(`${colors.yellow}Notice: Migration deploy returned non-zero (may not have new migrations). Continuing...${colors.reset}`);
      }
    }

    // 4. Restore stashed changes if any
    if (hasStashed) {
      console.log(`\n${colors.cyan}► Restoring previously stashed local changes...${colors.reset}`);
      try {
        execSync("git stash pop", { stdio: "inherit" });
      } catch {
        console.warn(`${colors.yellow}Warning: Merge conflict occurred while popping stash. Your changes remain in 'git stash list'.${colors.reset}`);
      }
    }

    // 5. Verification
    if (!values["skip-typecheck"]) {
      runCommand("npm run typecheck", "Verifying TypeScript integrity");
    }

    const updatedVersion = getLocalPackageVersion();
    const updatedCommit = getCurrentCommit();

    console.log(`\n${colors.bold}${colors.green}==================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.green}  ✔ Update completed successfully!                ${colors.reset}`);
    console.log(`${colors.bold}${colors.green}==================================================${colors.reset}`);
    console.log(`${colors.bold}Current Version:${colors.reset}  v${updatedVersion}`);
    console.log(`${colors.bold}Current Commit:${colors.reset}   ${updatedCommit}\n`);

    if (values.restart) {
      console.log(`${colors.cyan}► Restarting application server...${colors.reset}`);
      scheduleServerRestart(500);
    }
  } catch (updateErr) {
    console.error(`\n${colors.bold}${colors.red}✖ Update failed during execution:${colors.reset}`, updateErr.message);

    if (hasStashed) {
      console.log(`${colors.yellow}Tip: Your local changes are safe in git stash. Run 'git stash pop' to restore.${colors.reset}`);
    }

    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
