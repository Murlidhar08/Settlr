#!/usr/bin/env node
/* global process, console, require */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const dotenv = require("dotenv");
const { Client } = require("pg");

// 1. Load environment variables (.env.local, .env.production, .env)
const envFiles = [".env.local", ".env"];
for (const file of envFiles) {
  const fullPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath, override: file === ".env.local" });
  }
}

/**
 * Generates a cryptographically secure random password.
 */
function generatePassword(length = 16) {
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const all = lowercase + uppercase + numbers;

  const passwordChars = [
    lowercase[crypto.randomInt(lowercase.length)],
    uppercase[crypto.randomInt(uppercase.length)],
    numbers[crypto.randomInt(numbers.length)],
  ];

  for (let i = passwordChars.length; i < length; i++) {
    passwordChars.push(all[crypto.randomInt(all.length)]);
  }

  // Shuffle
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join("");
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("\n❌ Error: DATABASE_URL is not set.");
    console.error("Please ensure DATABASE_URL is defined in your environment or env file.\n");
    process.exit(1);
  }

  const { hashPassword } = await import("better-auth/crypto");
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();

    // 1. Find the first admin user created (or earliest account)
    let userRes = await client.query(
      `SELECT id, name, email, username, role 
       FROM "user" 
       WHERE role like '%admin%' 
       ORDER BY "createdAt" ASC 
       LIMIT 1`
    );

    if (userRes.rows.length === 0) {
      // Fallback to the first user in the database
      userRes = await client.query(
        `SELECT id, name, email, username, role 
         FROM "user" 
         ORDER BY "createdAt" ASC 
         LIMIT 1`
      );
    }

    if (userRes.rows.length === 0) {
      console.error("\n❌ No users found in the database.");
      console.error("💡 Start the application and complete setup first.\n");
      process.exit(1);
    }

    const user = userRes.rows[0];

    // 2. Generate random password (or use optional command-line argument if provided)
    const customPassword = process.argv[2] && !process.argv[2].startsWith("-") ? process.argv[2] : null;
    const newPassword = customPassword || generatePassword(16);

    // 3. Hash the new password with Better Auth
    const hashedPassword = await hashPassword(newPassword);

    // 4. Update or insert credential account
    const accountRes = await client.query(
      `SELECT id FROM "account" WHERE "userId" = $1 AND "providerId" = 'credential' LIMIT 1`,
      [user.id]
    );

    if (accountRes.rows.length > 0) {
      await client.query(
        `UPDATE "account" SET "password" = $1, "updatedAt" = NOW() WHERE id = $2`,
        [hashedPassword, accountRes.rows[0].id]
      );
    } else {
      const accountId = crypto.randomUUID().replace(/-/g, "");
      await client.query(
        `INSERT INTO "account" (id, "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
         VALUES ($1, $2, 'credential', $2, $3, NOW(), NOW())`,
        [accountId, user.id, hashedPassword]
      );
    }

    // 5. Ensure user status is approved, email verified, and unbanned
    await client.query(
      `UPDATE "user" 
       SET "emailVerified" = true, 
           "status" = 'approved', 
           "banned" = false, 
           "banReason" = NULL, 
           "banExpires" = NULL, 
           "twoFactorEnabled" = false, 
           "updatedAt" = NOW() 
       WHERE id = $1`,
      [user.id]
    );

    // 6. Disable 2FA and revoke active sessions
    await client.query(`DELETE FROM "two_factor" WHERE "userId" = $1`, [user.id]);
    await client.query(`DELETE FROM "session" WHERE "userId" = $1`, [user.id]);

    // 7. Output result
    console.log("\n=========================================");
    console.log("       PASSWORD RESET SUCCESSFUL!        ");
    console.log("=========================================\n");
    console.log(`👤 Admin User:    ${user.name}`);
    console.log(`📧 Email:         ${user.email || "N/A"}`);
    if (user.username) {
      console.log(`🔖 Username:      ${user.username}`);
    }
    console.log(`👑 Role:          ${user.role}`);
    console.log(`🔑 New Password:  ${newPassword}`);
    console.log(`✨ Status:        Approved & Email Verified`);
    console.log(`🔒 2FA:           Disabled`);
    console.log(`🌐 Sign-in URL:   ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login\n`);
  } catch (error) {
    console.error("\n❌ An error occurred while resetting the password:", error);
    process.exit(1);
  } finally {
    await client.end().catch(() => { });
  }
}

main();
