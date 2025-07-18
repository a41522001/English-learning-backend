import { saltPassword, decodePassword, createToken, handleServiceError, decodeRefreshToken } from '../utils';
import prisma from '../db';
import { v4 as uuidv4 } from 'uuid';
import ApiError from '../models/errorModel';
import { LoginResponse, Userinfo } from '../types';
import { Request } from 'express';
// 註冊
export const handleSignup = async (username: string, email: string, password: string): Promise<void> => {
  const bcryptPassword = await saltPassword(password);
  try {
    const user = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      throw new ApiError('此信箱已被註冊過', 400);
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
  } catch (error) {
    handleServiceError(error);
  }
};

// 登入
export const handleLogin = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const user = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      const isPasswordCorrect = await decodePassword(password, user.password!);
      if (isPasswordCorrect) {
        const accessToken = createToken(user.id, email, 'access');
        const refreshToken = createToken(user.id, email, 'refresh');
        return {
          access: accessToken,
          refresh: refreshToken,
        };
      } else {
        throw new ApiError('錯誤的帳號密碼', 400);
      }
    } else {
      throw new ApiError('錯誤的帳號密碼', 400);
    }
  } catch (error) {
    return handleServiceError(error);
  }
};

// 取得userinfo
export const getUserinfo = async (id: string, email: string): Promise<Userinfo> => {
  try {
    const user = await prisma.users.findFirst({
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
      },
      where: {
        id: id,
        email: email,
      },
    });

    if (user) {
      return user;
    } else {
      throw new ApiError('伺服器錯誤', 500);
    }
  } catch (error) {
    return handleServiceError(error);
  }
};

// 確認Access Token解開的資訊是否真實存在
export const checkAccessToken = async (id: string, email: string): Promise<boolean> => {
  try {
    const user = await prisma.users.findFirst({
      where: {
        id: id,
        email: email,
      },
    });
    const isUserExist = !!user;
    return isUserExist;
  } catch (error) {
    return handleServiceError(error);
  }
};

// refresh token
export const handleRefreshToken = async (req: Request): Promise<string> => {
  try {
    const result = await decodeRefreshToken(req);
    const { id, email } = result;
    const isUserExist = await checkAccessToken(id, email);
    if (isUserExist) {
      const accessToken = createToken(id, email, 'access');
      return accessToken;
    } else {
      throw new ApiError('找不到使用者，請重新登入', 401, 403);
    }
  } catch (error) {
    return handleServiceError(error);
  }
};
