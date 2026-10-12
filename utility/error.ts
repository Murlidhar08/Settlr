import { getErrorMessage } from "@/lib/errors/error-handler";

/**
 * Re-exported for backward compatibility. Prefer @/lib/errors.
 */
export function getErrorMsg(error: unknown): string {
  return getErrorMessage(error);
}