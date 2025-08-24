import * as z from 'zod';

export const ValidateSignup = z.object({
  username: z.string(),
  email: z.email(),
  password: z.string(),
});
