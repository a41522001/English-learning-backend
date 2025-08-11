import { saltPassword, decodePassword, createAccessToken, generateRefreshTokenTime } from '../utils';
import prisma from '../config/prisma';
import { v4 as uuidv4 } from 'uuid';
import ApiError from '../models/errorModel';
import { LoginResponse } from '../types';
import { Request } from 'express';
import { checkDailyWordsTaken } from './wordService';
import { Userinfo } from '../types/ResponseType';
import { env } from '../config/env';
// 註冊
export const handleSignup = async (username: string, email: string, password: string): Promise<void> => {
  const bcryptPassword = await saltPassword(password);
  const user = await prisma.users.findFirst({
    where: {
      email: email,
    },
  });
  if (user) {
    throw new ApiError('此信箱已被註冊過', { statusCode: 400 });
  } else {
    await prisma.users.create({
      data: {
        id: uuidv4(),
        username,
        email,
        password: bcryptPassword,
        created_at: new Date(),
      },
    });
  }
};

// 登入
export const handleLogin = async (email: string, password: string): Promise<LoginResponse> => {
  const user = await prisma.users.findFirst({
    where: {
      email: email,
    },
  });
  if (user) {
    const isPasswordCorrect = await decodePassword(password, user.password!);
    if (isPasswordCorrect) {
      const refreshToken = uuidv4();
      const expireTime = generateRefreshTokenTime();
      await prisma.token.upsert({
        where: {
          user_id: user.id,
        },
        update: {
          refresh_token: refreshToken,
          expired_at: expireTime,
        },
        create: {
          user_id: user.id,
          refresh_token: refreshToken,
          expired_at: expireTime,
        },
      });
      const accessToken = createAccessToken(user.id);
      const { isDaily } = await checkDailyWordsTaken(user.id);

      return {
        access: accessToken,
        refresh: refreshToken,
        isDaily,
      };
    } else {
      throw new ApiError('錯誤的帳號密碼', { statusCode: 400 });
    }
  } else {
    throw new ApiError('錯誤的帳號密碼', { statusCode: 400 });
  }
};

// 取得userinfo
export const getUserinfo = async (id: string): Promise<Userinfo> => {
  const user = await prisma.users.findFirst({
    select: {
      id: true,
      username: true,
      email: true,
      created_at: true,
    },
    where: {
      id: id,
    },
  });
  if (user) {
    return user;
  } else {
    throw new Error();
  }
};

// 確認Access Token解開的資訊是否真實存在
export const checkAccessToken = async (id: string): Promise<boolean> => {
  const user = await prisma.users.findFirst({
    where: {
      id: id,
    },
  });
  const isUserExist = !!user;
  return isUserExist;
};

// refresh token
export const handleRefreshToken = async (req: Request): Promise<{ accessToken: string; refreshToken: string }> => {
  const cookieRefreshToken = req.cookies.refresh;
  if (!cookieRefreshToken) {
    throw new ApiError('缺少 Refresh Token', { statusCode: 401, errorCode: 403 });
  }
  // 查詢user和token是否符合
  const isUserExist = await prisma.token.findFirst({
    where: {
      refresh_token: cookieRefreshToken,
      expired_at: {
        gt: new Date(),
      },
    },
  });

  // 如果存在刷新token
  if (isUserExist) {
    const expireTime = generateRefreshTokenTime();
    const userId = isUserExist.user_id;
    const refreshToken = uuidv4();
    await prisma.token.upsert({
      where: {
        user_id: userId,
      },
      update: {
        refresh_token: refreshToken,
        expired_at: expireTime,
      },
      create: {
        user_id: userId,
        refresh_token: refreshToken,
        expired_at: expireTime,
      },
    });
    const accessToken = createAccessToken(userId);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  } else {
    throw new ApiError('找不到使用者，請重新登入', { statusCode: 401, errorCode: 403 });
  }
};

// 登出
export const handleLogout = async (userId: string): Promise<boolean> => {
  const isSuccess = await prisma.token.delete({
    where: {
      user_id: userId,
    },
  });
  return !!isSuccess;
};
