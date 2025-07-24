interface ApiErrorType {
  statusCode?: number;
  errorCode?: number;
}
class ApiError extends Error {
  statusCode: number;
  errorCode?: number;
  isOperational: boolean;
  constructor(message: string, { statusCode, errorCode }: ApiErrorType = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode ?? 500;
    this.isOperational = true;
    this.errorCode = errorCode ?? statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
  static badRequest(message: string, errorCode?: number) {
    return new ApiError(message, { statusCode: 400, errorCode });
  }
}

export default ApiError;
