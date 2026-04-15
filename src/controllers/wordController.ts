import { Response, NextFunction } from 'express';
import { wordService } from '../services/index';
import ResponseModel from '../utils/response';
import { getUserId } from '../utils';
import type { RequestCustom } from '../types/index';

//
export const getSubjectCategory = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const result = await wordService.handleGetSubjectCategory();
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};
// 取得主題單字
export const getSubjectWords = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const subject = req.query.subject as string;
    const userId = getUserId(req);
    const result = await wordService.handleGetSubjectWords(subject, userId);
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};

// 取得單字例句
export const getWordExample = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const wordId = req.query.wordId as string;
    const result = await wordService.handleGetWordExample(wordId);
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};

// 取得每日單字
export const getDailyWords = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const result = await wordService.handleGetDailyWords(userId);
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};

// 確認是否拿過每日單字
export const checkIsDaily = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const isDaily = await wordService.checkDailyWordsTaken(userId);
    res.status(200).json(ResponseModel.successResponse(isDaily));
  } catch (error) {
    next(error);
  }
};

// 儲存已學過單字
export const saveLearnedWord = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const { wordId } = req.body;
    const userId = getUserId(req);
    await wordService.handleSaveLearnedWord(userId, wordId);
    res.status(200).json(ResponseModel.successResponse(null));
  } catch (error) {
    next(error);
  }
};

// 刪除已學過單字
export const deleteLearnedWord = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const { wordId } = req.params;
    const userId = getUserId(req);
    await wordService.handleDeleteLearnedWord(userId, wordId);
    res.status(200).json(ResponseModel.successResponse(null));
  } catch (error) {
    next(error);
  }
};

// 取得已學過單字
export const getLearnedWords = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const result = await wordService.handleGetLearnedWords(userId);
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};

// 取得已學過單字(分頁)
export const getLearnedWordsPage = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const itemPerPage = req.query.itemPerPage as string;
    const page = req.query.page as string;
    const userId = getUserId(req);
    const result = await wordService.handleGetLearnedWords(userId, +itemPerPage, +page);
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};

// 取得已學過單字數量
export const getLearnedWordCount = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const result = await wordService.handleGetLearnedWordCount(userId);
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};

// 改變我的最愛狀態
export const changeFavorite = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const { wordId, status } = req.body;
    const userId = getUserId(req);
    await wordService.handleChangeFavorite(userId, wordId, status);
    res.status(200).json(ResponseModel.successResponse(null));
  } catch (error) {
    next(error);
  }
};

// 取得我的最愛單字
export const getFavorite = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const result = await wordService.handleGetFavorite(userId);
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};
