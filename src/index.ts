import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import user from './routes/userRoute';
import word from './routes/wordRoute';
import handleError from './middleware/handleError';
import cookieParser from 'cookie-parser';
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [process.env.FRONT_END_URL!],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(cookieParser());
app.use('/api/user', user);
app.use('/api/word', word);
app.use(handleError);
app.listen(port, () => {
  console.log(port);
});
