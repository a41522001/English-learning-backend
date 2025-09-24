import { Response } from 'express';
import { env } from '../config/env';
const isProduction = env.NODE_ENVIRONMENT === 'production';

export const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  } as const;
};

export const clearAuthCookies = (res: Response): void => {
  const options = getCookieOptions();
  res.clearCookie('access', options);
  res.clearCookie('refresh', options);
};
