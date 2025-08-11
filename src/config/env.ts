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
  ACCESS_TOKEN_EXPIRE: validateEnv('ACCESS_TOKEN_EXPIRE'),
  REFRESH_TOKEN_SECRET: validateEnv('REFRESH_TOKEN_SECRET'),
  DEEPL_API_KEY: validateEnv('DEEPL_API_KEY'),
  DICTIONARY_API_KEY: validateEnv('DICTIONARY_API_KEY'),
  API_URL: validateEnv('API_URL'),
  MERRIAM_WEBSTER_URL: validateEnv('MERRIAM_WEBSTER_URL'),
  MERRIAM_WEBSTER_API_KEY: validateEnv('MERRIAM_WEBSTER_API_KEY'),
  WORDS_API_URL: validateEnv('WORDS_API_URL'),
  WORDS_API_KEY: validateEnv('WORDS_API_KEY'),
  WORDS_API_HOST: validateEnv('WORDS_API_HOST'),
  REFRESH_TOKEN_EXPIRE: validateEnv('REFRESH_TOKEN_EXPIRE'),
} as const;
