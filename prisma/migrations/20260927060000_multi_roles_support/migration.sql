-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'moderator';

-- AlterTable (Safely preserve existing roles by casting to TEXT)
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE TEXT USING ("role"::TEXT);
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user';
