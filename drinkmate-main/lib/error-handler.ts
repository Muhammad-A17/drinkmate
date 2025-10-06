import { NextRequest, NextResponse } from 'next/server';

// Standard error response interface
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  code?: string;
  details?: any;
  timestamp: string;
  path?: string;
}

// Error types enum
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

// Error codes mapping
export const ERROR_CODES = {
  VALIDATION_ERROR: 'E001',
  AUTHENTICATION_ERROR: 'E002',
  AUTHORIZATION_ERROR: 'E003',
  NOT_FOUND_ERROR: 'E004',
  CONFLICT_ERROR: 'E005',
  RATE_LIMIT_ERROR: 'E006',
  INTERNAL_SERVER_ERROR: 'E007',
  EXTERNAL_API_ERROR: 'E008',
  DATABASE_ERROR: 'E009',
  NETWORK_ERROR: 'E010',
} as const;

// HTTP status codes mapping
export const HTTP_STATUS = {
  [ErrorType.VALIDATION_ERROR]: 400,
  [ErrorType.AUTHENTICATION_ERROR]: 401,
  [ErrorType.AUTHORIZATION_ERROR]: 403,
  [ErrorType.NOT_FOUND_ERROR]: 404,
  [ErrorType.CONFLICT_ERROR]: 409,
  [ErrorType.RATE_LIMIT_ERROR]: 429,
  [ErrorType.INTERNAL_SERVER_ERROR]: 500,
  [ErrorType.EXTERNAL_API_ERROR]: 502,
  [ErrorType.DATABASE_ERROR]: 503,
  [ErrorType.NETWORK_ERROR]: 504,
} as const;

// Custom error class
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    type: ErrorType,
    message: string,
    details?: any
  ) {
    super(message);
    this.type = type;
    this.code = ERROR_CODES[type];
    this.statusCode = HTTP_STATUS[type];
    this.details = details;
    
    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response creator
export function createErrorResponse(
  error: AppError | Error,
  request?: NextRequest
): NextResponse<ErrorResponse> {
  let errorResponse: ErrorResponse;
  
  if (error instanceof AppError) {
    errorResponse = {
      success: false,
      message: error.message,
      error: error.type,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString(),
      path: request?.url,
    };
  } else {
    // Handle unknown errors
    errorResponse = {
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
      error: ErrorType.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES[ErrorType.INTERNAL_SERVER_ERROR],
      timestamp: new Date().toISOString(),
      path: request?.url,
    };
  }

  const statusCode = error instanceof AppError ? error.statusCode : 500;
  
  return NextResponse.json(errorResponse, { status: statusCode });
}

// Validation error creator
export function createValidationError(
  message: string,
  details?: any
): AppError {
  return new AppError(ErrorType.VALIDATION_ERROR, message, details);
}

// Authentication error creator
export function createAuthError(
  message: string = 'Authentication required'
): AppError {
  return new AppError(ErrorType.AUTHENTICATION_ERROR, message);
}

// Authorization error creator
export function createAuthorizationError(
  message: string = 'Insufficient permissions'
): AppError {
  return new AppError(ErrorType.AUTHORIZATION_ERROR, message);
}

// Not found error creator
export function createNotFoundError(
  resource: string = 'Resource'
): AppError {
  return new AppError(ErrorType.NOT_FOUND_ERROR, `${resource} not found`);
}

// Conflict error creator
export function createConflictError(
  message: string
): AppError {
  return new AppError(ErrorType.CONFLICT_ERROR, message);
}

// Rate limit error creator
export function createRateLimitError(
  message: string = 'Too many requests'
): AppError {
  return new AppError(ErrorType.RATE_LIMIT_ERROR, message);
}

// External API error creator
export function createExternalAPIError(
  service: string,
  message?: string
): AppError {
  return new AppError(
    ErrorType.EXTERNAL_API_ERROR,
    message || `External API error: ${service}`,
    { service }
  );
}

// Database error creator
export function createDatabaseError(
  message: string = 'Database operation failed'
): AppError {
  return new AppError(ErrorType.DATABASE_ERROR, message);
}

// Network error creator
export function createNetworkError(
  message: string = 'Network request failed'
): AppError {
  return new AppError(ErrorType.NETWORK_ERROR, message);
}

// Error handler wrapper for API routes
export function withErrorHandler(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('API Error:', error);
      return createErrorResponse(error as Error, req);
    }
  };
}

// Success response creator
export function createSuccessResponse<T = any>(
  data: T,
  message: string = 'Success',
  status: number = 200
): NextResponse {
  return NextResponse.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }, { status });
}

// Pagination response creator
export function createPaginatedResponse<T = any>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message: string = 'Success'
): NextResponse {
  return NextResponse.json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  });
}

// Error handler class for API operations
export class ErrorHandler {
  static handle(error: any, context?: string): { message: string; code: string } {
    console.error(`Error in ${context || 'API'}:`, error);
    
    if (error.response?.data?.message) {
      return {
        message: error.response.data.message,
        code: error.response.data.code || 'API_ERROR'
      };
    }
    
    if (error.message) {
      return {
        message: error.message,
        code: 'NETWORK_ERROR'
      };
    }
    
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    };
  }
}

// API response creator
export function createApiResponse<T = any>(
  success: boolean,
  data: T,
  message: string = 'Success',
  code?: string
): { success: boolean; data: T; message: string; code?: string } {
  return {
    success,
    data,
    message,
    ...(code && { code })
  };
}