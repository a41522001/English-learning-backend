import { Request, Response, NextFunction } from 'express';
import { handleSignup, handleLogin, getUserinfo, handleRefreshToken } from '../services/userService';
import ResponseModel from '../utils/response';
import { decodeAccessToken } from '../utils/index';
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;
    await handleSignup(username, email, password);
    res.status(200).json(ResponseModel.successResponse(null, '創建成功, 請登入'));
  } catch (error) {
    next(error);
  }
};
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { access, refresh } = await handleLogin(email, password);
    res.cookie('access', access, {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    res.cookie('refresh', refresh, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    res.status(200).json(ResponseModel.loginResponse('登入成功', 100));
  } catch (error) {
    next(error);
  }
};
export const userinfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decodedUser = await decodeAccessToken(req);
    const { id, email } = decodedUser;
    const result = await getUserinfo(id, email);
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = await handleRefreshToken(req);
    res.cookie('access', accessToken, {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    res.status(200).json(ResponseModel.successResponse(null));
  } catch (error) {
    next(error);
  }
};
