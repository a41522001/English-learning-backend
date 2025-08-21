import { Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import ApiError from '../models/errorModel';
import { RequestCustom } from '../types/index';
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 5,
  // keyGenerator: (req: Request): string => req.ip as string,
  statusCode: 429,
  handler: (req: RequestCustom, _res: Response, next: NextFunction, opts) => {
    const waitSec = Math.ceil(opts.windowMs / 1000);
    next(new ApiError(`嘗試過多，請於 ${waitSec} 秒後再試`, { statusCode: 429 }));
  },
});
export default limiter;
