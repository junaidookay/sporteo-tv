// Custom error types and utilities
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'AUTH_ERROR', 401, details)
    this.name = 'AuthError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, details?: unknown) {
    super(`${resource} not found`, 'NOT_FOUND', 404, details)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class PaymentError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'PAYMENT_ERROR', 400, details)
    this.name = 'PaymentError'
  }
}

export class StreamError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'STREAM_ERROR', 503, details)
    this.name = 'StreamError'
  }
}

// Error handler utility
export function handleError(error: unknown): { message: string; code: string; statusCode: number } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
    }
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  }
}

// Logging utility
export const logger = {
  info: (message: string, data?: unknown) => {
    console.log(`[INFO] ${message}`, data || '')
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data || '')
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error || '')
  },
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data || '')
    }
  },
}
