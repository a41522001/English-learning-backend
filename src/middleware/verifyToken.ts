import { Request, Response, NextFunction } from 'express';
import { checkAccessToken } from '../services/userService';
import { decodeAccessToken } from '../utils/index';
import ApiError from '../models/errorModel';
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await decodeAccessToken(req);
    const { id, email } = result;
    const isUserExist = await checkAccessToken(id, email);
    if (isUserExist) {
      next();
    } else {
      throw new ApiError('找不到此使用者', 401, 400);
    }
  } catch (error) {
    next(error);
  }
};
export default verifyToken;
