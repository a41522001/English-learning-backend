import { Response, NextFunction } from 'express';
import z from 'zod';
import type { RequestCustom } from '../types/index';
import ApiError from '../models/errorModel';
type RequestProperty = 'body' | 'query' | 'params';
const validateRequest = (zodInstance: z.ZodObject, requestProperty: RequestProperty) => {
  return (req: RequestCustom, res: Response, next: NextFunction) => {
    const { success, error, data } = zodInstance.safeParse(req[requestProperty]);
    if (!success && error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues;
        const msg = messages.map((item) => item.message).join(', ');
        next(new ApiError(msg, { errorCode: 400, statusCode: 400 }));
        return;
      }
      return next(error);
    } else {
      req[requestProperty] = data;
      next();
    }
  };
};
export default validateRequest;
