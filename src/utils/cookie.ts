import { Response } from 'express';
import { env } from '../config/env';
export const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  path: '/',
} as const;
// 清cookie
export const clearCookie = (res: Response): void => {
  const isProduction = env.NODE_ENVIRONMENT === 'production';
  res.clearCookie('access', { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', path: '/' });
  res.clearCookie('refresh', { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', path: '/' });
};
