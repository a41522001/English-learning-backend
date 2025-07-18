class ApiError extends Error {
  public statusCode: number;
  public code: number;
  constructor(message: string, statusCode: number, code?: number) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || statusCode;
  }
}
export default ApiError;
