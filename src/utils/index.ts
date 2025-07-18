import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import type { DecodedToken, TokenOptions, TokenType } from '../types/index';
import { Request } from 'express';
import ApiError from '../models/errorModel';
dotenv.config();

/**
 * 創建Token
 * @param {string} userId - user.id
 * @param {string} email - user.email
 * @param {keyof TokenExpire} type - token 的類型，決定過期時間 'access' or 'refresh'
 * @returns {string} token
 */
export const createToken = (userId: string, email: string, type: keyof TokenType): string => {
  const tokenObject = { id: userId, email: email };
  const tokenOptions: TokenOptions = {
    access: {
      secret: process.env.ACCESS_TOKEN_SECRET!,
      expire: '15m',
    },
    refresh: {
      secret: process.env.REFRESH_TOKEN_SECRET!,
      expire: '7d',
    },
  } as const;
  const options: SignOptions = {
    expiresIn: tokenOptions[type].expire,
  };
  const token = jwt.sign(tokenObject, tokenOptions[type].secret, options);
  return token;
};

/**
 * 對密碼進行加鹽hash處理。
 * @param {string} password - 需要hash處理的純文字密碼。
 * @returns {Promise<string>} hash過的密碼字串。
 */
export const saltPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const bcryptPassword = await bcrypt.hash(password, saltRounds);
  return bcryptPassword;
};

/**
 * 比對純文字密碼與hash過的密碼是否相符。
 * @param {string} userPassword - 使用者輸入的純文字密碼。
 * @param {string} hashPassword - 資料庫中儲存的hash密碼。
 * @returns {Promise<boolean>} 如果密碼相符則解析為 true，否則為 false。
 */
export const decodePassword = async (userPassword: string, hashPassword: string): Promise<boolean> => {
  const isPasswordExist = await bcrypt.compare(userPassword, hashPassword);
  return isPasswordExist;
};

// 解密access token
export const decodeAccessToken = (req: Request): Promise<DecodedToken> => {
  return new Promise((resolve, reject) => {
    const accessToken = req.cookies.access;

    if (!accessToken) {
      return reject(new ApiError('無攜帶token', 401));
    }
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!, (err: any, decoded: any) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          reject(new ApiError('Token已過期', 401));
        } else if (err.name === 'JsonWebTokenError') {
          reject(new ApiError('請重新登入', 401, 403));
        } else {
          reject(new ApiError('伺服器錯誤', 500));
        }
        return;
      }
      resolve(decoded as DecodedToken);
    });
  });
};

// 解密refresh token
export const decodeRefreshToken = (req: Request): Promise<DecodedToken> => {
  return new Promise((resolve, reject) => {
    const refreshToken = req.cookies.refresh;
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, (err: any, decoded: any) => {
      if (err) {
        return reject(new ApiError('請重新登入', 401, 403));
      }
      resolve(decoded as DecodedToken);
    });
  });
};
// 處理資料庫錯誤或自定義錯誤
export const handleServiceError = (error: unknown): never => {
  if (error instanceof ApiError) {
    throw error;
  }
  throw new ApiError('伺服器發生未知錯誤，請稍後再試', 500);
};
