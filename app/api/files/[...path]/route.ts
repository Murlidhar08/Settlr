import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getAbsolutePath } from "@/lib/file-operations";
import { getServerSession } from "@/lib/auth/auth";
import { apiError } from "@/lib/api/response";
import { UnauthorizedError, NotFoundError, ForbiddenError } from "@/lib/errors/app-error";
import { hasPermission } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma/prisma";
import { UserStatus } from "@/lib/generated/prisma/enums";

const CONTENT_TYPE_MAP: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  pdf: "application/pdf",
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  txt: "text/plain",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

// SVG excluded to prevent same-origin script execution inside iframe previews (H-1)
const PREVIEWABLE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "pdf", "mp4", "webm", "ogg"]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      throw new UnauthorizedError("You must be logged in to view file assets");
    }

    const user = session.user as any;
    if (user.banned || user.status === UserStatus.banned) {
      throw new ForbiddenError("Your account has been banned");
    }
    if (user.status === UserStatus.suspended) {
      throw new ForbiddenError("Your account has been suspended");
    }
    if (user.status === UserStatus.pendingapproval) {
      throw new ForbiddenError("Your account is pending administrator approval");
    }

    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      throw new NotFoundError("File path not specified");
    }

    const rawPath = pathSegments.join("/");
    const normalizedPath = rawPath.replace(/\\/g, "/");
    const absolutePath = getAbsolutePath(normalizedPath);

    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundError(`File not found: ${normalizedPath}`);
    }

    // Authorization checks (C-4):
    // 1. Profile avatars (profile/...) are accessible to active authenticated users
    const isAvatar = normalizedPath.startsWith("profile/");

    if (!isAvatar) {
      // 2. KYC & user documents: require ownership or storage:read permission
      const doc = await prisma.userDocument.findFirst({
        where: {
          OR: [
            { documentRelativePath: normalizedPath },
            { documentRelativePath: `/api/files/${normalizedPath}` },
            { documentRelativePath: { endsWith: normalizedPath } }
          ]
        },
        select: { userId: true }
      });

      const hasStorageRead = await hasPermission("storage", "read");
      const isOwner = doc ? doc.userId === session.user.id : normalizedPath.startsWith(`document/${session.user.id}/`);

      if (!isOwner && !hasStorageRead) {
        // Return 404 to avoid leaking file existence to unauthorized users
        throw new NotFoundError("File not found");
      }
    }

    const fileName = pathSegments[pathSegments.length - 1];
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    const contentType = CONTENT_TYPE_MAP[extension] || "application/octet-stream";
    // If svg or not in previewable set, force attachment download
    const disposition = (PREVIEWABLE_EXTENSIONS.has(extension) && extension !== "svg") ? "inline" : "attachment";

    const stat = fs.statSync(absolutePath);
    const nodeStream = fs.createReadStream(absolutePath);
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        nodeStream.destroy();
      }
    });

    return new NextResponse(webStream as any, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
