import { ZodError } from "zod";
import { AppError } from "./app-error";

export interface StandardErrorResponse {
  message: string;
  code: string;
  statusCode: number;
  details?: unknown;
}

/**
 * Normalizes any error into a predictable StandardErrorResponse format.
 */
export function normalizeError(error: unknown): StandardErrorResponse {
  // 1. Handled Domain AppError
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  // 2. Zod Validation Error
  if (error instanceof ZodError) {
    const formattedIssues = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return {
      message: formattedIssues[0]?.message || "Input validation failed",
      code: "VALIDATION_ERROR",
      statusCode: 400,
      details: formattedIssues,
    };
  }

  // 3. String permission errors thrown by guards (e.g. "UNAUTHORIZED", "FORBIDDEN")
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return {
        message: "You must be signed in to perform this action",
        code: "UNAUTHORIZED",
        statusCode: 401,
      };
    }

    if (error.message === "FORBIDDEN") {
      return {
        message: "You do not have permission to perform this action",
        code: "FORBIDDEN",
        statusCode: 403,
      };
    }

    // Generic standard Error
    const isDev = process.env.NODE_ENV === "development";
    return {
      message: isDev ? error.message : "An unexpected server error occurred",
      code: "INTERNAL_SERVER_ERROR",
      statusCode: 500,
      details: isDev ? error.stack : undefined,
    };
  }

  // 4. Unknown non-Error throw
  return {
    message: "An unknown error occurred",
    code: "UNKNOWN_ERROR",
    statusCode: 500,
    details: String(error),
  };
}

/**
 * Extracts a human-readable message from any error value.
 * Safe for client-side display or toast notifications.
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  return normalizeError(error).message;
}
