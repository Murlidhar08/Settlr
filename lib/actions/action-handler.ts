import { normalizeError } from "@/lib/errors/error-handler";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; details?: unknown };

/**
 * Wraps a Server Action with uniform error handling and standardized results.
 */
export async function safeAction<T>(actionFn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await actionFn();
    return { success: true, data };
  } catch (error) {
    const normalized = normalizeError(error);
    console.error(`[Server Action Error] [${normalized.code}]:`, error);
    return {
      success: false,
      error: normalized.message,
      code: normalized.code,
      details: normalized.details,
    };
  }
}
