import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt, { SignOptions } from 'jsonwebtoken';
import ApiError from '../models/errorModel';
import { checkAccessToken } from '../services/userService';
import { RequestCustom, DecodedToken } from '../types';
import { env } from '../config/env';
import prisma from '../config/prisma';
import { createAccessToken, generateRefreshTokenTime } from '../utils';
import { clearAuthCookies, getCookieOptions } from '../utils/cookie';
const verifyToken = async (req: RequestCustom, res: Response, next: NextFunction) => {
  const cookieAccessToken = req.cookies?.access;
  // 解access token
  if (cookieAccessToken) {
    try {
      const { sub } = jwt.verify(cookieAccessToken, env.ACCESS_TOKEN_SECRET, {
        algorithms: ['HS256'],
        issuer: env.API_URL,
      }) as DecodedToken;

      const user = await prisma.users.findUnique({
        select: {
          id: true,
        },
        where: {
          sub: sub,
        },
      });

      if (user) {
        req.userId = user.id;
        return next();
      }
      clearAuthCookies(res);
      return next(new ApiError('請重新登入', { statusCode: 401 }));
    } catch (error: any) {
      if (error.name !== 'TokenExpiredError') {
        clearAuthCookies(res);
        return next(new ApiError('請重新登入', { statusCode: 401 }));
      }
    }
  }

  // 解fresh token
  const cookieRefreshToken = req.cookies?.refresh;
  if (!cookieRefreshToken) {
    clearAuthCookies(res);
    return next(new ApiError('請重新登入', { statusCode: 401 }));
  }

  const now = new Date();
  try {
    // 查refresh token
    const isRefreshTokenExist = await prisma.users.findFirst({
      select: {
        sub: true,
        token: true,
      },
      where: {
        token: {
          refresh_token: cookieRefreshToken,
          expired_at: {
            gt: now,
          },
        },
      },
    });
    if (isRefreshTokenExist && isRefreshTokenExist.token) {
      const { sub, token: tokenTable } = isRefreshTokenExist;
      const refreshToken = uuidv4();
      const expireTime = generateRefreshTokenTime();
      const oldExpiredAt = new Date(Date.now() + 15_000); // 15s
      const userId = tokenTable.user_id;
      const { count } = await prisma.token.updateMany({
        where: {
          user_id: userId,
          refresh_token: cookieRefreshToken,
          expired_at: { gt: now },
        },
        data: {
          refresh_token: refreshToken,
          expired_at: expireTime,
          old_refresh_token: cookieRefreshToken,
          old_expired_at: oldExpiredAt,
        },
      });

      if (count === 1) {
        const accessToken = createAccessToken(sub);
        res.cookie('access', accessToken, {
          maxAge: 15 * 60 * 1000,
          ...getCookieOptions(),
        });
        res.cookie('refresh', refreshToken, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          ...getCookieOptions(),
        });
        req.userId = userId;
        return next();
      }
    }

    // 查舊的refresh token
    const isOldRefreshTokenExist = await prisma.token.findFirst({
      where: {
        old_refresh_token: cookieRefreshToken,
        old_expired_at: {
          gt: now,
        },
      },
    });
    if (isOldRefreshTokenExist) {
      const userId = isOldRefreshTokenExist.user_id;
      const user = await prisma.users.findUnique({ where: { id: userId }, select: { sub: true } });
      if (user) {
        const accessToken = createAccessToken(user.sub);
        res.cookie('access', accessToken, {
          maxAge: 15 * 60 * 1000,
          ...getCookieOptions(),
        });
        req.userId = userId;
        return next();
      }
      clearAuthCookies(res);
      return next(new ApiError('請重新登入', { statusCode: 401 }));
    }
    clearAuthCookies(res);
    return next(new ApiError('請重新登入', { statusCode: 401 }));
  } catch (error) {
    clearAuthCookies(res);
    return next(new ApiError('請重新登入', { statusCode: 401 }));
  }
};

export default verifyToken;
