import {
  saltPassword,
  decodePassword,
  createAccessToken,
  generateRefreshTokenTime,
} from '../utils';
import type { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import ApiError from '../models/errorModel';
import { LoginResponse } from '../types';
import { WordService } from './wordService';
import { Userinfo } from '../types/ResponseType';

export class UserService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly wordService: WordService,
  ) {}
  // 註冊
  async handleSignup(username: string, email: string, password: string): Promise<void> {
    const bcryptPassword = await saltPassword(password);
    const user = await this.prisma.users.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      throw new ApiError('此信箱已被註冊過', { statusCode: 400 });
    } else {
      await this.prisma.users.create({
        data: {
          id: uuidv4(),
          username,
          email,
          password: bcryptPassword,
          created_at: new Date(),
        },
      });
    }
  }

  // 登入
  async handleLogin(email: string, password: string): Promise<LoginResponse> {
    const user = await this.prisma.users.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      const isPasswordCorrect = await decodePassword(password, user.password!);
      if (isPasswordCorrect) {
        const refreshToken = uuidv4();
        const expireTime = generateRefreshTokenTime();
        await this.prisma.token.upsert({
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
        const { isDaily } = await this.wordService.checkDailyWordsTaken(user.id);

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
  }

  // 取得userinfo
  async getUserinfo(id: string): Promise<Userinfo> {
    const user = await this.prisma.users.findFirst({
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
  }

  // 確認Access Token解開的資訊是否真實存在
  async checkAccessToken(id: string): Promise<boolean> {
    const user = await this.prisma.users.findFirst({
      where: {
        id: id,
      },
    });
    const isUserExist = !!user;
    return isUserExist;
  }

  // 登出
  // TODO: 已棄用
  async handleLogout(userId: string): Promise<boolean> {
    const isSuccess = await this.prisma.token.delete({
      where: {
        user_id: userId,
      },
    });
    return !!isSuccess;
  }
}
