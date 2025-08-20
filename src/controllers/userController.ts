import { Response, NextFunction } from 'express';
import { handleSignup, handleLogin, getUserinfo, handleLogout } from '../services/userService';
import ResponseModel from '../utils/response';
import { getUserId } from '../utils/index';
import type { RequestCustom } from '../types/index';
import { clearCookie } from '../utils/cookie';

// 註冊
export const signup = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;
    await handleSignup(username, email, password);
    res.status(200).json(ResponseModel.successResponse(null, '創建成功, 請登入'));
  } catch (error) {
    next(error);
  }
};

// 登入
export const login = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { access, refresh, ...isDaily } = await handleLogin(email, password);
    res.cookie('access', access, {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    res.cookie('refresh', refresh, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    res.status(200).json(ResponseModel.loginResponse('登入成功', 100, isDaily));
  } catch (error) {
    next(error);
  }
};

// 取得使用者資訊
export const userinfo = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const result = await getUserinfo(userId);
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};

// 登出
export const logout = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    clearCookie(res);
    res.status(200).json(ResponseModel.successResponse(null));
  } catch (error) {
    res.status(200).json(ResponseModel.successResponse(null));
  }
};
// 忘記密碼
// TODO: 未做
export const forgetPassword = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
  } catch (error) {
    next(error);
  }
};
