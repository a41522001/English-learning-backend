import dotenv from 'dotenv';
dotenv.config();
const validateEnv = (key: string): string => {
  const v = process.env[key];
  if (v === null || v == '' || v === undefined) {
    throw new Error(`${key} 環境變數未設置`);
  } else {
    return v;
  }
};
export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  FRONT_END_URL: validateEnv('FRONT_END_URL'),
  ACCESS_TOKEN_SECRET: validateEnv('ACCESS_TOKEN_SECRET'),
  REFRESH_TOKEN_SECRET: validateEnv('REFRESH_TOKEN_SECRET'),
  DEEPL_API_KEY: validateEnv('DEEPL_API_KEY'),
  DICTIONARY_API_KEY: validateEnv('DICTIONARY_API_KEY'),
} as const;
