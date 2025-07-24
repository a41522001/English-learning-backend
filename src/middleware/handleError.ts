import { Request, Response, NextFunction } from 'express';
import ResponseModel from '../utils/response';
import ApiError from '../models/errorModel';

const handleError = (err: any, req: Request, res: Response, next: NextFunction) => {
  const isApiError = err instanceof ApiError;
  const status = err.statusCode;
  const errorCode = err.errorCode;
  const message = err.message;
  console.error({
    path: req.path,
    method: req.method,
    message: err.message,
    stack: err.stack,
    errorCode,
  });
  if (isApiError) {
    res.status(status).json(ResponseModel.errorResponse(message, errorCode));
    return;
  }
  res.status(500).json(ResponseModel.errorResponse('伺服器發生錯誤，請稍後在試', 500));
};
export default handleError;
