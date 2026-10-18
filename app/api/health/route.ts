import { prisma } from "@/lib/prisma/prisma";
import packageJson from "@/package.json";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return apiSuccess({
      status: "healthy",
      message: "Server is healthy",
      version: packageJson.version,
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Health Check Failed]:", error);
    return apiError(error, 500);
  }
}
