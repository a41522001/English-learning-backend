import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { env } from '../config/env';
import type { DecodedToken, TokenOptions, TokenType } from '../types/index';
import { Request } from 'express';
import ApiError from '../models/errorModel';
import axios, { AxiosPromise } from 'axios';
import * as deepl from 'deepl-node';
import { createHash, randomUUID } from 'crypto';
import type { StringValue } from 'ms';
/**
 * 創建Token
 * @param {string} userId - user.id
 * @returns {string} token
 */
export const createAccessToken = (userId: string): string => {
  const payload = {
    issuer: env.API_URL,
    sub: userId,
    jti: createHash('sha256').update(randomUUID()).digest('hex'),
  };

  const options: SignOptions = {
    expiresIn: env.ACCESS_TOKEN_EXPIRE as StringValue,
    algorithm: 'HS256',
  };
  const token = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, options);
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
      return reject(new ApiError('無攜帶token', { statusCode: 401 }));
    }
    jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET, (err: any, decoded: any) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          reject(new ApiError('Token已過期', { statusCode: 401 }));
        } else if (err.name === 'JsonWebTokenError') {
          reject(new ApiError('請重新登入', { statusCode: 401, errorCode: 403 }));
        } else {
          reject(new Error());
        }
        return;
      }
      resolve(decoded as DecodedToken);
    });
  });
};

// Dictionary API
export const handleGetDictionary = async (word: string) => {
  const dictionaryURL = env.DICTIONARY_API_KEY;
  try {
    const res = await axios(`${dictionaryURL}${word}`);
    const result = res.data.map((item: any) => {
      const { word, phonetic, phonetics, meanings } = item;
      const mean = meanings[0];
      return {
        word,
        phonetic,
        pronounce: phonetics[0]?.audio ?? '',
        mean: mean?.partOfSpeech ?? '',
        definition: mean?.definitions[0]?.definition ?? '',
        example: mean?.definitions[0]?.example ?? '',
      };
    });
    // console.dir(res.data, {
    //   depth: null, // null = 不限制深度
    // });
    // console.log(result);

    return { ok: true, word, result };
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status && error.response.data.title === 'No Definitions Found') {
      return { ok: false, word, reason: 'NOT_FOUND', error: error };
    }
    return { ok: false, word, reason: 'NETWORK', error: error };
  }
};
// deepL API
export const handleDeepLTranslator = async (origin: string) => {
  const authKey = env.DEEPL_API_KEY;
  const translator = new deepl.Translator(authKey);
  const result = await translator.translateText(origin, 'en', 'zh-HANT');
  return result;
};
// 取得User ID
export const getUserId = async (req: Request): Promise<string> => {
  const { sub } = await decodeAccessToken(req);
  return sub;
};
// 韋氏辭典
export const getDictionary = (word: string) => {
  const dictionaryURL = env.MERRIAM_WEBSTER_URL;
  const dictionaryAPIKEY = env.MERRIAM_WEBSTER_API_KEY;
  const API_URL = `${dictionaryURL.replace('{}', word)}?key=${dictionaryAPIKEY}`;
  return axios.get(API_URL);
};
// WORDS_API
export const getWordsAPI = (word: string) => {
  const wordsURL = env.WORDS_API_URL.replace('{}', word);
  const wordsAPIKEY = env.WORDS_API_KEY;
  const wordsHOST = env.WORDS_API_HOST;
  const options = {
    method: 'GET',
    url: wordsURL,
    headers: {
      'x-rapidapi-key': wordsAPIKEY,
      'x-rapidapi-host': wordsHOST,
    },
  };
  return axios.request(options);
};
// 取得今日日期
// YYYYMMDD
export const getToday = () => convertDate(new Date());
// 轉換日期
// ISO時間轉YYYYMMDD
export const convertDate = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, '');
