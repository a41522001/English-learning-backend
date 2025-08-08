import { Router } from 'express';
import { getSubjectWords, getWordExample, getDailyWords, checkIsDaily } from '../controllers/wordController';
import verifyToken from '../middleware/verifyToken';
const router = Router();
router.get('/checkIsDaily', verifyToken, checkIsDaily);
router.get('/subjectWords', getSubjectWords);
router.get('/wordExample', getWordExample);
export default router;
