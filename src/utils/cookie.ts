import { Response } from 'express';
export const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  path: '/',
} as const;
// 清cookie
export const clearCookie = (res: Response): void => {
  res.clearCookie('access', { httpOnly: true, secure: false, sameSite: 'lax', path: '/' });
  res.clearCookie('refresh', { httpOnly: true, secure: false, sameSite: 'lax', path: '/' });
};
