import { Router } from 'express';
import { getSubjectWords } from '../controllers/wordController';
const router = Router();
router.get('/subjectWords', getSubjectWords);
export default router;
