import { Request, Response, NextFunction } from 'express';
import { handleGetSubjectWords, handleGetWordExample, handleGetDailyWords, checkDailyWordsTaken } from '../services/wordService';
import ResponseModel from '../utils/response';
import { getUserId } from '../utils';
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
export const getWordExample = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wordId = req.query.wordId as string;
    const result = await handleGetWordExample(wordId);
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};
export const getDailyWords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getUserId(req);
    await handleGetDailyWords(userId);
  } catch (error) {
    next(error);
  }
};
export const checkIsDaily = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getUserId(req);
    const isDaily = await checkDailyWordsTaken(userId);
    res.status(200).json(ResponseModel.successResponse({ isDaily }));
  } catch (error) {
    next(error);
  }
};
