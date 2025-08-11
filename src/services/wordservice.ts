import prisma from '../config/prisma';
import { MappingPartOfSpeech } from '../types';
import { handleGetDictionary, handleDeepLTranslator, getDictionary, getWordsAPI, getToday } from '../utils';
import type { CheckDaily, WordExample, WordsSubject } from '../types/ResponseType';
import ApiError from '../models/errorModel';
const mappingPartOfSpeech: MappingPartOfSpeech = {
  noun: '名詞',
  verb: '動詞',
  adjective: '形容詞',
  adverb: '副詞',
  pronoun: '代詞',
  preposition: '介系詞／介詞',
  numeral: '數詞',
  determiner: '限定詞',
  'modal verb': '情態動詞',
  conjunction: '連接詞',
  article: '冠詞',
  'auxiliary verb': '助動詞',
  particle: '助詞',
  interjection: '感嘆詞',
  ordinal: '序數詞',
};

// 取得主題單字
export const handleGetSubjectWords = async (subject: string, userId: string): Promise<WordsSubject[]> => {
  const { isDaily } = await checkDailyWordsTaken(userId);
  if (isDaily || !subject) {
    return handleGetDailyWords(userId);
  }

  const wordIds: string[] = [];
  const data: WordsSubject[] = [];
  // TODO: 之後要改查詢方式 判斷result夠不夠10個沒有的話要繼續查 再沒有的話從別的類別查
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
  result.forEach((item) => {
    const { id, word, pronunciation, category } = item;
    wordIds.push(id);
    data.push({
      id,
      word,
      pronunciation: pronunciation ?? '',
      category: category?.name ?? '',
      categoryName: category?.show_name ?? '',
      learned: false,
    });
  });
  await saveDailyWord(userId, wordIds);
  return data;
};

// 取得每日單字
export const handleGetDailyWords = async (userId: string): Promise<WordsSubject[]> => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
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
      words_storage: {
        where: {
          user_id: userId,
          learn_at: {
            gte: start,
            lt: end,
          },
        },
        select: { word_id: true },
        take: 1,
      },
    },
    where: {
      words_daily: {
        some: {
          user_id: userId,
          created_at: {
            gte: start,
            lt: end,
          },
        },
      },
    },
  });

  return result.map((item) => {
    const { id, word, pronunciation, category } = item;
    return {
      id,
      word,
      pronunciation: pronunciation ?? '',
      category: category?.name ?? '',
      categoryName: category?.show_name ?? '',
      learned: item.words_storage.length > 0,
    };
  });
};

// 取得單字例句
export const handleGetWordExample = async (wordId: string): Promise<WordExample[]> => {
  const result = await prisma.word_mean.findMany({
    where: {
      word_id: wordId,
    },
  });
  const mappingData = result.map((item) => {
    return {
      exampleSentenceEn: item.example_sentence_en,
      exampleSentenceZn: item.example_sentence_zh,
      meanZh: item.mean_zh,
      partOfSpeech: mappingPartOfSpeech[item.part_of_speech as keyof MappingPartOfSpeech] ?? '未知',
    };
  });
  return mappingData;
};

// 儲存每日單字
const saveDailyWord = async (userId: string, wordIds: string[]) => {
  await prisma.words_daily.createMany({
    data: wordIds.map((wordId) => ({
      user_id: userId,
      word_id: wordId,
      created_at: new Date(),
    })),
    skipDuplicates: true,
  });
};

// 確認是否拿過每日單字
export const checkDailyWordsTaken = async (userId: string): Promise<CheckDaily> => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const result = await prisma.words_daily.findFirst({
    where: {
      user_id: userId,
      created_at: {
        gte: start,
        lt: end,
      },
    },
  });
  return {
    isDaily: !!result,
  };
};

// 儲存已學過單字
export const handleSaveLearnedWord = async (userId: string, wordId: string | string[]) => {
  if (Array.isArray(wordId)) {
    await prisma.words_storage.createMany({
      data: wordId.map((word) => {
        return {
          word_id: word,
          user_id: userId,
          learn_at: new Date(),
        };
      }),
      skipDuplicates: true,
    });
  } else {
    await prisma.words_storage.create({
      data: {
        word_id: wordId,
        user_id: userId,
        learn_at: new Date(),
      },
    });
  }
};

// 刪除已儲存單字
export const handleDeleteLearnedWord = async (userId: string, wordId: string) => {
  await prisma.words_storage.delete({
    where: {
      user_id_word_id: {
        user_id: userId,
        word_id: wordId,
      },
    },
  });
};
