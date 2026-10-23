#!/usr/bin/env node
import dotenv from "dotenv";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import readline from "node:readline";
import { parseArgs } from "node:util";

// Load environment variables (.env.local, .env)
const envFiles = [".env.local", ".env"];
for (const envFileName of envFiles) {
  const envPath = resolve(process.cwd(), envFileName);
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: envFileName === ".env.local" });
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

import {
  checkForUpdates,
  compareSemver,
  getCurrentBranch,
  getCurrentCommit,
  getGitRemoteRepo,
  getLocalPackageVersion,
  parseSemver,
  scheduleServerRestart,
} from "../lib/system/app-updater";
import type { SystemUpdateStatus } from "../types/admin-dashboard";

export type UpdateInfo = SystemUpdateStatus;
export {
  checkForUpdates,
  compareSemver,
  getCurrentBranch,
  getCurrentCommit,
  getGitRemoteRepo,
  getLocalPackageVersion,
  parseSemver
};


/**
 * Prompt question in terminal.
 */
function promptQuestion(query: string): Promise<string> {
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
function runCommand(cmd: string, description: string): void {
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
${colors.bold}GitHub Auto-Updater for Next-Template${colors.reset}

Checks GitHub for newer releases, versions in package.json, or commits, and automates pulling, installing dependencies, and running migrations.

${colors.bold}USAGE:${colors.reset}
  npm run update                Interactive update check and apply
  npm run update:check          Check only (no changes made)
  npm run update:apply          Auto-apply update non-interactively

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
  tsx scripts/auto-update.ts --check
  tsx scripts/auto-update.ts --branch main
`);
    process.exit(0);
  }

  console.log(`\n${colors.bold}${colors.cyan}==================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}         Next-Template GitHub Auto-Updater        ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}==================================================${colors.reset}\n`);

  console.log(`${colors.dim}Checking for updates on GitHub...${colors.reset}`);

  let info: UpdateInfo;
  try {
    info = await checkForUpdates({
      repo: values.repo,
      branch: values.branch,
    });
  } catch (err: any) {
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
      } catch (prismaErr: any) {
        console.warn(`${colors.yellow}Notice: Migration deploy returned non-zero (may not have new migrations). Continuing...${colors.reset}`);
      }
    }

    // 4. Restore stashed changes if any
    if (hasStashed) {
      console.log(`\n${colors.cyan}► Restoring previously stashed local changes...${colors.reset}`);
      try {
        execSync("git stash pop", { stdio: "inherit" });
      } catch (stashErr) {
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
  } catch (updateErr: any) {
    console.error(`\n${colors.bold}${colors.red}✖ Update failed during execution:${colors.reset}`, updateErr.message);

    if (hasStashed) {
      console.log(`${colors.yellow}Tip: Your local changes are safe in git stash. Run 'git stash pop' to restore.${colors.reset}`);
    }

    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].includes("auto-update")) {
  main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
