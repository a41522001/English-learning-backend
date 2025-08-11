import { Request, Response, NextFunction } from 'express';
import {
  handleGetSubjectWords,
  handleGetWordExample,
  handleGetDailyWords,
  checkDailyWordsTaken,
  handleSaveLearnedWord,
  handleDeleteLearnedWord,
  handleGetLearnedWords,
  handleGetSubjectCategory,
} from '../services/wordService';
import ResponseModel from '../utils/response';
import { getUserId } from '../utils';

//
export const getSubjectCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await handleGetSubjectCategory();
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};
// 取得主題單字
export const getSubjectWords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subject = req.query.subject as string;
    const userId = await getUserId(req);
    const result = await handleGetSubjectWords(subject, userId);
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};

// 取得單字例句
export const getWordExample = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wordId = req.query.wordId as string;
    const result = await handleGetWordExample(wordId);
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};

// 取得每日單字
export const getDailyWords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getUserId(req);
    await handleGetDailyWords(userId);
  } catch (error) {
    next(error);
  }
};

// 確認是否拿過每日單字
export const checkIsDaily = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getUserId(req);
    const isDaily = await checkDailyWordsTaken(userId);
    res.status(200).json(ResponseModel.successResponse(isDaily));
  } catch (error) {
    next(error);
  }
};

// 儲存已學過單字
export const saveLearnedWord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wordId } = req.body;
    const userId = await getUserId(req);
    await handleSaveLearnedWord(userId, wordId);
    res.status(200).json(ResponseModel.successResponse(null));
  } catch (error) {
    next(error);
  }
};

// 刪除已學過單字
export const deleteLearnedWord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wordId } = req.params;
    const userId = await getUserId(req);
    await handleDeleteLearnedWord(userId, wordId);
    res.status(200).json(ResponseModel.successResponse(null));
  } catch (error) {
    next(error);
  }
};

// 取得已學過單字
export const getLearnedWords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getUserId(req);
    const result = await handleGetLearnedWords(userId);
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};
