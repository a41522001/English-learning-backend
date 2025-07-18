import { Router } from 'express';
import { signup, login, userinfo, refreshToken } from '../controllers/userController';
import verifyToken from '../middleware/verifyToken';
const router = Router();
router.post('/signup', signup);
router.post('/login', login);
router.get('/userinfo', verifyToken, userinfo);
router.get('/refresh', refreshToken);
export default router;
