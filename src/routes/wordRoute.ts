import { Router } from 'express';
import {
  getSubjectWords,
  getWordExample,
  getDailyWords,
  checkIsDaily,
  saveLearnedWord,
  deleteLearnedWord,
  getLearnedWords,
  getSubjectCategory,
} from '../controllers/wordController';
const router = Router();

router.get('/subjectCategory', getSubjectCategory);
router.get('/checkIsDaily', checkIsDaily);
router.get('/subjectWords', getSubjectWords);
router.get('/wordExample', getWordExample);
router.post('/saveLearnedWord', saveLearnedWord);
router.delete('/learnedWord/:wordId', deleteLearnedWord);
router.get('/learnedWords', getLearnedWords);
export default router;
