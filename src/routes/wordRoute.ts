import { Router } from 'express';
import {
  getSubjectWords,
  getWordExample,
  checkIsDaily,
  saveLearnedWord,
  deleteLearnedWord,
  getLearnedWords,
  getSubjectCategory,
  getLearnedWordsPage,
  getLearnedWordCount,
} from '../controllers/wordController';
const router = Router();

router.get('/subjectCategory', getSubjectCategory);
router.get('/checkIsDaily', checkIsDaily);
router.get('/subjectWords', getSubjectWords);
router.get('/wordExample', getWordExample);
router.post('/saveLearnedWord', saveLearnedWord);
router.delete('/learnedWord/:wordId', deleteLearnedWord);
router.get('/learnedWords', getLearnedWords);
router.get('/learnedWordsPage', getLearnedWordsPage);
router.get('/learnedWordCount', getLearnedWordCount);
export default router;
