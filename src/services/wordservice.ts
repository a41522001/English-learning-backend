import prisma from '../config/prisma';
import { handleGetDictionary, handleDeepLTranslator, getDictionary, getWordsAPI } from '../utils';
export const handleGetSubjectWords = async (subject: string, userId: string) => {
  const result = await prisma.words.findMany({
    select: {
      id: true,
      word: true,
      pronunciation: true,
      category: {
        select: {
          name: true,
          show_name: true,
        },
      },
    },
    where: {
      words_storage: {
        none: {
          user_id: userId,
        },
      },
      category: {
        name: subject,
      },
    },
    take: 10,
  });
  const data = result.map((item) => {
    const { id, word, pronunciation, category } = item;
    return {
      id,
      word,
      pronunciation,
      category: category!.name,
      categoryName: category!.show_name,
    };
  });
  return data;
};
export const handleGetDailyWords = async () => {};
export const handleGetWordExample = async (wordId: string) => {
  const result = await prisma.word_mean.findMany({
    where: {
      word_id: wordId,
    },
  });
  return result;
};
