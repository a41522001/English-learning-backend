import * as z from 'zod';

export const ValidateSignup = z.object({
  username: z.string().max(30, '姓名長度需在30字以內').min(1, '需填寫姓名'),
  email: z.email('email格式錯誤'),
  password: z.string().min(1, '需填寫密碼'),
});
