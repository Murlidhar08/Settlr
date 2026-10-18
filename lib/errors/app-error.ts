/**
 * Standard Application Error Hierarchy
 * Provides typed, predictable error handling across Server Actions and API Routes.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_SERVER_ERROR",
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required", details?: unknown) {
    super(message, 401, "UNAUTHORIZED", details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "You do not have permission to perform this action", details?: unknown) {
    super(message, 403, "FORBIDDEN", details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Requested resource not found", details?: unknown) {
    super(message, 404, "NOT_FOUND", details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict detected", details?: unknown) {
    super(message, 409, "CONFLICT", details);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", details?: unknown) {
    super(message, 400, "BAD_REQUEST", details);
  }
}
