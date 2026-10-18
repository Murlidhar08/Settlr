import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getAbsolutePath } from "@/lib/file-operations";
import { getServerSession } from "@/lib/auth/auth";
import { apiError } from "@/lib/api/response";
import { UnauthorizedError, NotFoundError } from "@/lib/errors/app-error";

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

const PREVIEWABLE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "svg", "webp", "pdf", "mp4", "webm", "ogg"]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      throw new UnauthorizedError("You must be logged in to view file assets");
    }

    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      throw new NotFoundError("File path not specified");
    }

    const rawPath = pathSegments.join("/");
    const normalizedPath = rawPath.replace(/\\/g, "/");
    const absolutePath = getAbsolutePath(normalizedPath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`[File API] File not found at ${absolutePath} (Requested: ${normalizedPath})`);
      throw new NotFoundError(`File not found: ${normalizedPath}`);
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    const fileName = pathSegments[pathSegments.length - 1];
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    const contentType = CONTENT_TYPE_MAP[extension] || "application/octet-stream";
    const disposition = PREVIEWABLE_EXTENSIONS.has(extension) ? "inline" : "attachment";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
