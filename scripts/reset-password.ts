#!/usr/bin/env node
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import crypto from "node:crypto";
import readline from "node:readline";
import { parseArgs } from "node:util";
import dotenv from "dotenv";

// 1. Load environment variables before any application imports
const envFiles = [".env.local", ".env"];
for (const envFileName of envFiles) {
  const envPath = resolve(process.cwd(), envFileName);
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: envFileName === ".env.local" });
  }
}

/**
 * Generates a cryptographically secure random password.
 */
function generateSecurePassword(length = 16): string {
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const symbols = "!@#$%^&*()_+~=-";
  const all = lowercase + uppercase + numbers + symbols;

  const passwordChars = [
    lowercase[crypto.randomInt(lowercase.length)],
    uppercase[crypto.randomInt(uppercase.length)],
    numbers[crypto.randomInt(numbers.length)],
    symbols[crypto.randomInt(symbols.length)],
  ];

  for (let i = passwordChars.length; i < length; i++) {
    passwordChars.push(all[crypto.randomInt(all.length)]);
  }

  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join("");
}

/**
 * Prompts the user via terminal with optional character masking.
 */
function promptQuestion(query: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (!hidden || !process.stdin.isTTY || !process.stdin.setRawMode) {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
      return;
    }

    try {
      process.stdout.write(query);
      let input = "";

      const onData = (chunk: Buffer) => {
        const str = chunk.toString("utf8");

        for (let i = 0; i < str.length; i++) {
          const char = str[i];

          if (char === "\r" || char === "\n" || char === "\u0004") {
            cleanup();
            process.stdout.write("\n");
            resolve(input.trim());
            return;
          } else if (char === "\u0003") {
            // Handle Ctrl+C
            cleanup();
            process.stdout.write("\n");
            process.exit(130);
          } else if (char === "\u0008" || char === "\x7f") {
            // Handle Backspace
            if (input.length > 0) {
              input = input.slice(0, -1);
              process.stdout.write("\b \b");
            }
          } else if (char >= " ") {
            input += char;
            process.stdout.write("*");
          }
        }
      };

      const cleanup = () => {
        process.stdin.removeListener("data", onData);
        if (process.stdin.isTTY && process.stdin.setRawMode) {
          process.stdin.setRawMode(false);
        }
        process.stdin.pause();
        rl.close();
      };

      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on("data", onData);
    } catch {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

function showHelp() {
  console.log(`
Usage: npm run reset-password [options] [email_or_username]

Reset the password for the main admin account, first created account, or a specified account.

Options:
  -e, --email <email>         Target user by email address
  -u, --user <username>       Target user by username
  -p, --password <password>   Specify the new password directly
  -g, --generate              Generate a secure random password automatically
  --disable-2fa               Disable Two-Factor Authentication (2FA) for the account
  --no-revoke                 Do not revoke existing active sessions
  -h, --help                  Show this help message

Examples:
  npm run reset-password
  npm run reset-password -- -g
  npm run reset-password -- -p "NewSecurePass123!"
  npm run reset-password -- --email admin@example.com
  npm run reset-password -- admin@example.com -g --disable-2fa
`);
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      email: { type: "string", short: "e" },
      user: { type: "string", short: "u" },
      password: { type: "string", short: "p" },
      generate: { type: "boolean", short: "g", default: false },
      "disable-2fa": { type: "boolean", default: false },
      "no-revoke": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    showHelp();
    process.exit(0);
  }

  // 2. Dynamically import database and auth modules after env initialization
  const { prisma } = await import("@/lib/prisma/prisma");
  const { UserStatus } = await import("@/lib/generated/prisma/enums");
  const { hashPassword } = await import("better-auth/crypto");

  try {
    const identifier = values.email || values.user || positionals[0];
    let targetUser = null;

    if (identifier) {
      // Find user by explicit email, username, or id
      targetUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: identifier, mode: "insensitive" } },
            { username: { equals: identifier, mode: "insensitive" } },
            { id: identifier },
          ],
        },
      });

      if (!targetUser) {
        console.error(`\n❌ User not found matching "${identifier}".\n`);
        process.exit(1);
      }
    } else {
      // 1. Look for earliest admin account ("main account")
      targetUser = await prisma.user.findFirst({
        where: { role: "admin" },
        orderBy: { createdAt: "asc" },
      });

      // 2. Fallback to first created account in database
      if (!targetUser) {
        targetUser = await prisma.user.findFirst({
          orderBy: { createdAt: "asc" },
        });
      }
    }

    if (!targetUser) {
      console.error("\n❌ No users found in the database.");
      console.error("💡 Start your development server and navigate to /setup to initialize the application.\n");
      process.exit(1);
    }

    console.log("\n=========================================");
    console.log("       ACCOUNT PASSWORD RESET TOOL       ");
    console.log("=========================================\n");
    console.log(`👤 Target User Account:`);
    console.log(`   ID:        ${targetUser.id}`);
    console.log(`   Name:      ${targetUser.name}`);
    console.log(`   Email:     ${targetUser.email}`);
    console.log(`   Username:  ${targetUser.username || "N/A"}`);
    console.log(`   Role:      ${targetUser.role}`);
    console.log(`   Status:    ${targetUser.status}`);
    console.log(`   2FA:       ${targetUser.twoFactorEnabled ? "Enabled" : "Disabled"}`);
    console.log(`   Created:   ${targetUser.createdAt.toISOString()}`);
    console.log("-----------------------------------------");

    let newPassword = values.password;
    let isAutoGenerated = false;

    if (!newPassword) {
      if (values.generate) {
        newPassword = generateSecurePassword(16);
        isAutoGenerated = true;
      } else if (process.stdin.isTTY) {
        console.log("\nEnter a new password (min 8 chars), or press Enter to auto-generate one:");
        const enteredPassword = await promptQuestion("New Password: ", true);

        if (!enteredPassword) {
          newPassword = generateSecurePassword(16);
          isAutoGenerated = true;
          console.log("⚡ Auto-generated password selected.");
        } else {
          if (enteredPassword.length < 8) {
            console.error("\n❌ Password must be at least 8 characters long.\n");
            process.exit(1);
          }

          const confirmedPassword = await promptQuestion("Confirm Password: ", true);
          if (enteredPassword !== confirmedPassword) {
            console.error("\n❌ Passwords do not match. Aborting.\n");
            process.exit(1);
          }

          newPassword = enteredPassword;
        }
      } else {
        // Non-interactive fallback
        newPassword = generateSecurePassword(16);
        isAutoGenerated = true;
      }
    } else {
      if (newPassword.length < 8) {
        console.error("\n❌ Password must be at least 8 characters long.\n");
        process.exit(1);
      }
    }

    // Two-Factor Authentication check
    let disable2fa = values["disable-2fa"];
    if (targetUser.twoFactorEnabled && !disable2fa && process.stdin.isTTY && !values.password && !values.generate) {
      const answer = await promptQuestion("\n⚠️ Two-Factor Authentication (2FA) is enabled for this account. Disable 2FA? (y/N): ");
      if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        disable2fa = true;
      }
    }

    console.log("\n⏳ Updating credentials...");

    // 1. Hash new password using Better Auth's scrypt implementation
    const hashedPassword = await hashPassword(newPassword);

    // 2. Find or create credential account record
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: targetUser.id,
        providerId: "credential",
      },
    });

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.account.create({
        data: {
          id: crypto.randomUUID().replace(/-/g, ""),
          accountId: targetUser.id,
          providerId: "credential",
          userId: targetUser.id,
          password: hashedPassword,
        },
      });
    }

    // 3. Ensure account status is approved and email is verified
    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        emailVerified: true,
        status: UserStatus.approved,
        banned: false,
        banReason: null,
        banExpires: null,
      },
    });

    // 4. Handle 2FA reset if requested
    if (disable2fa) {
      await prisma.twoFactor.deleteMany({
        where: { userId: targetUser.id },
      });
      await prisma.user.update({
        where: { id: targetUser.id },
        data: { twoFactorEnabled: false },
      });
      console.log("✔ Two-Factor Authentication (2FA) has been disabled.");
    }

    // 5. Revoke sessions unless explicitly skipped
    let revokedSessionCount = 0;
    if (!values["no-revoke"]) {
      const result = await prisma.session.deleteMany({
        where: { userId: targetUser.id },
      });
      revokedSessionCount = result.count;
      console.log(`✔ Revoked ${revokedSessionCount} active session(s).`);
    }

    console.log("\n=========================================");
    console.log("       PASSWORD RESET SUCCESSFUL!        ");
    console.log("=========================================\n");
    console.log(`✔ Account:      ${targetUser.email} (${targetUser.role})`);
    if (isAutoGenerated || values.password) {
      console.log(`🔑 New Password: ${newPassword}`);
    } else {
      console.log(`🔑 New Password: [Password successfully set]`);
    }
    console.log(`✨ Status:        Approved & Verified`);
    console.log(`🌐 Sign-in URL:   ${process.env.NEXT_PUBLIC_APP_URL}/login\n`);
  } catch (error) {
    console.error("\n❌ An unexpected error occurred while resetting the password:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
