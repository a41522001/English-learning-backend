import { Router } from 'express';
import { getSubjectWords, getWordExample } from '../controllers/wordController';
const router = Router();
router.get('/subjectWords', getSubjectWords);
router.get('/wordExample', getWordExample);
export default router;
