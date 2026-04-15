import { Response, NextFunction } from 'express';
import type { RequestCustom } from '../types/index';
export const getHealth = async (req: RequestCustom, res: Response, next: NextFunction) => {
  res.status(200).json('成功');
};
