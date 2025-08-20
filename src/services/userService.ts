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
      const accessToken = createAccessToken(user.sub);
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

// 登出
// TODO: 已棄用
export const handleLogout = async (userId: string): Promise<boolean> => {
  const isSuccess = await prisma.token.delete({
    where: {
      user_id: userId,
    },
  });
  return !!isSuccess;
};
