import prisma from '../config/prisma';
import { WordService } from './wordService';
import { UserService } from './userService';
export const wordService = new WordService(prisma);
export const userService = new UserService(prisma, wordService);
