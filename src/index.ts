import express from 'express';
import cors from 'cors';
import user from './routes/userRoute';
import word from './routes/wordRoute';
import handleError from './middleware/handleError';
import verifyToken from './middleware/verifyToken';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [env.FRONT_END_URL],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(cookieParser());
app.use('/api/user', user);
app.use('/api/word', verifyToken, word);
app.use(handleError);
app.listen(env.PORT, () => {
  console.log(env.PORT);
});
