import { Request, Response, NextFunction } from 'express';
import { handleGetSubjectWords, handleGetWordExample } from '../services/wordService';
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
