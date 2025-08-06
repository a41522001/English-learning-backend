import { Request, Response, NextFunction } from 'express';
import { checkAccessToken } from '../services/userService';
import { decodeAccessToken } from '../utils/index';
import ApiError from '../models/errorModel';
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sub } = await decodeAccessToken(req);
    const isUserExist = await checkAccessToken(sub);
    if (isUserExist) {
      next();
    } else {
      throw new ApiError('找不到此使用者', { statusCode: 401, errorCode: 400 });
    }
  } catch (error) {
    next(error);
  }
};
export default verifyToken;
