import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind and conditional classes safely.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
