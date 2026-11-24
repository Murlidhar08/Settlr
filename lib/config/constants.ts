import { Currency, ThemeMode } from "@/lib/generated/prisma/enums";

/**
 * Standard user preferences fallback defaults.
 */
export const MAX_ACCOUNTS = 5;

export const DEFAULT_USER_SETTINGS = {
  dateFormat: "dd MMM, yyyy",
  timeFormat: "hh:mm a",
  language: "en",
  theme: ThemeMode.LIGHT,
  currency: Currency.INR,
  currencySymbol: "₹",
  locale: "en-IN",
  debug: false
} as const;

/**
 * Currency metadata mappings
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.INR]: "₹",
  [Currency.USD]: "$",
  [Currency.EUR]: "€",
};

/**
 * Pagination and file upload constraints
 */
export const API_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const MAX_TRANSACTION_FILE_SIZE_MB = 10;
export const MAX_TRANSACTION_FILE_SIZE_BYTES = MAX_TRANSACTION_FILE_SIZE_MB * 1024 * 1024; // 10MB in bytes

export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_TRANSACTION_FILE_SIZE_MB,
  MAX_TRANSACTION_FILE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ALLOWED_TRANSACTION_DOC_EXTENSIONS: ["jpg", "jpeg", "png", "pdf"] as const,
} as const;
