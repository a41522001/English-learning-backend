import { Request, Response, NextFunction } from 'express';
import { handleGetSubjectWords } from '../services/wordservice';
import ResponseModel from '../utils/response';
export const getSubjectWords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subject = req.query.subject as string;
    const result = await handleGetSubjectWords(subject);
    res.status(200).json(ResponseModel.successResponse(result));
  } catch (error) {
    next(error);
  }
};
