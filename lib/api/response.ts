import { NextResponse } from "next/server";
import { normalizeError } from "@/lib/errors/error-handler";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Creates a standardized Next.js JSON success response.
 */
export function apiSuccess<T>(
  data: T,
  meta?: Record<string, unknown>,
  status: number = 200,
  headers?: HeadersInit
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    {
      status,
      headers,
    }
  );
}

/**
 * Creates a standardized Next.js JSON error response.
 */
export function apiError(
  error: unknown,
  statusOverride?: number,
  headers?: HeadersInit
): NextResponse<ApiErrorResponse> {
  const normalized = normalizeError(error);
  const status = statusOverride ?? normalized.statusCode;

  return NextResponse.json(
    {
      success: false,
      error: {
        message: normalized.message,
        code: normalized.code,
        ...(normalized.details ? { details: normalized.details } : {}),
      },
    },
    {
      status,
      headers,
    }
  );
}
