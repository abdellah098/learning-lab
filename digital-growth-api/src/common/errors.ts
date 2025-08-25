export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any[];

  constructor(
    statusCode: number, 
    code: string, 
    message: string, 
    details?: any[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
    
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, details?: any[]): ApiError {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string, details?: any[]): ApiError {
    return new ApiError(409, 'CONFLICT', message, details);
  }

  static validation(message: string, details?: any[]): ApiError {
    return new ApiError(422, 'VALIDATION_ERROR', message, details);
  }

  static tooManyRequests(message: string = 'Too many requests'): ApiError {
    return new ApiError(429, 'RATE_LIMITED', message);
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(500, 'INTERNAL', message);
  }
}