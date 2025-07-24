import prisma from '../config/prisma';
import { handleGetDictionary, handleDeepLTranslator } from '../utils/';
import pLimit from 'p-limit';

export const handleGetSubjectWords = async (subject: string) => {
  const result = await prisma.category.findMany({
    where: {
      name: subject,
      words: {
        dictionary_status: {
          not: 'not',
        },
      },
    },
    include: {
      words: true,
    },
    take: 25,
  });
  const limit = pLimit(5);
  const dictionaryTasks = result.map((item) => {
    const word = item.words.word!;
    return limit(() => handleGetDictionary(word));
  });
  const response = await Promise.allSettled(dictionaryTasks);
  // console.log(response);
  const okWords: string[] = [];
  const errorWords: string[] = [];
  const res = response.map((item: any) => {
    const value = item.value;
    console.log(value.ok);
    if (value.ok) {
      okWords.push(value.word);
      return value.result;
    } else if (!value.ok && value.reason === 'NOT_FOUND') {
      errorWords.push(value.word);
    }
  });
  console.log(okWords);
  console.log(errorWords);
  await prisma.$transaction([
    prisma.words.updateMany({
      where: { word: { in: okWords } },
      data: { dictionary_status: 'ok' },
    }),
    prisma.words.updateMany({
      where: { word: { in: errorWords } },
      data: { dictionary_status: 'not' },
    }),
  ]);
  // await prisma.words.updateMany({
  //   where: {
  //     dictionary_status: 'not',
  //   },
  //   data: {
  //     dictionary_status: 'pending',
  //   },
  // });
  return res.filter((item) => item).slice(0, 10);
};
export const handleGetDailyWords = async () => {};
