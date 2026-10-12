-- 1. Create new snake_case tables
CREATE TABLE "two_factor" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verified" BOOLEAN DEFAULT true,
    "failedVerificationCount" INTEGER DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),

    CONSTRAINT "two_factor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_settings" (
    "userId" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "locale" TEXT NOT NULL DEFAULT 'en-IN',
    "dateFormat" TEXT NOT NULL DEFAULT 'dd MMM, yyyy',
    "timeFormat" TEXT NOT NULL DEFAULT 'hh:mm a',
    "language" TEXT NOT NULL DEFAULT 'en',
    "theme" "ThemeMode" NOT NULL DEFAULT 'AUTO',

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE "app_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "smtpHost" TEXT,
    "smtpPort" INTEGER DEFAULT 587,
    "smtpUser" TEXT,
    "smtpPass" TEXT,
    "smtpSecure" BOOLEAN DEFAULT false,
    "fromEmail" TEXT,
    "googleClientId" TEXT,
    "googleClientSecret" TEXT,
    "discordClientId" TEXT,
    "discordClientSecret" TEXT,

    CONSTRAINT "app_config_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "documentRelativePath" TEXT NOT NULL,
    "documentType" "UserDocumentType" NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_document_pkey" PRIMARY KEY ("id")
);

-- 2. Migrate existing data from old camelCase tables into new snake_case tables
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'twoFactor') THEN
        INSERT INTO "two_factor" ("id", "secret", "backupCodes", "userId", "verified", "failedVerificationCount", "lockedUntil")
        SELECT "id", "secret", "backupCodes", "userId", "verified", "failedVerificationCount", "lockedUntil"
        FROM "twoFactor";
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'userSettings') THEN
        INSERT INTO "user_settings" ("userId", "currency", "locale", "dateFormat", "timeFormat", "language", "theme")
        SELECT "userId", "currency", "locale", "dateFormat", "timeFormat", "language", "theme"
        FROM "userSettings";
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'appConfig') THEN
        INSERT INTO "app_config" ("id", "smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpSecure", "fromEmail", "googleClientId", "googleClientSecret", "discordClientId", "discordClientSecret")
        SELECT "id", "smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpSecure", "fromEmail", "googleClientId", "googleClientSecret", "discordClientId", "discordClientSecret"
        FROM "appConfig";
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'userDocument') THEN
        INSERT INTO "user_document" ("id", "userId", "fileName", "extension", "documentRelativePath", "documentType", "createdBy", "createdAt", "updatedAt")
        SELECT "id", "userId", "fileName", "extension", "documentRelativePath", "documentType", "createdBy", "createdAt", "updatedAt"
        FROM "userDocument";
    END IF;
END $$;

-- 3. Drop foreign keys from old tables
ALTER TABLE IF EXISTS "twoFactor" DROP CONSTRAINT IF EXISTS "twoFactor_userId_fkey";
ALTER TABLE IF EXISTS "userDocument" DROP CONSTRAINT IF EXISTS "userDocument_userId_fkey";
ALTER TABLE IF EXISTS "userSettings" DROP CONSTRAINT IF EXISTS "userSettings_userId_fkey";

-- 4. Drop old tables safely after data transfer
DROP TABLE IF EXISTS "appConfig";
DROP TABLE IF EXISTS "twoFactor";
DROP TABLE IF EXISTS "userDocument";
DROP TABLE IF EXISTS "userSettings";

-- 5. Create indexes on new tables
CREATE INDEX "two_factor_secret_idx" ON "two_factor"("secret");
CREATE INDEX "two_factor_userId_idx" ON "two_factor"("userId");
CREATE INDEX "user_document_userId_idx" ON "user_document"("userId");

-- 6. Add foreign keys to new tables
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_document" ADD CONSTRAINT "user_document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
