import prisma from '../config/prisma';
import { MappingPartOfSpeech, WordQueryResult } from '../types';
import type { CheckDaily, LearnedWord, LearnedWordCount, SubjectCategory, WordExample, WordsSubject } from '../types/ResponseType';
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

// 隨機創建主題
const handleRandomSubject = (subjects: string[]): string => {
  const index = Math.floor(Math.random() * subjects.length);
  return subjects[index];
};

// 尋找主題單字
const findSubjectWords = async (userId: string, sub: string, take: number) => {
  return await prisma.words.findMany({
    select: {
      id: true,
      word: true,
      pronunciation: true,
      category: {
        select: {
          category_setting: {
            select: {
              title: true,
              subject: true,
            },
          },
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
        subject: sub,
      },
    },
    take: take,
  });
};

// 取得主題類別
export const handleGetSubjectCategory = async (): Promise<SubjectCategory[]> => {
  const res = await prisma.category_setting.findMany();
  const result = res.map((item) => {
    const { bg_color, content, hover_color, icon, icon_color, subject, title } = item;
    return {
      bgColor: bg_color,
      hoverColor: hover_color,
      iconColor: icon_color,
      content,
      icon,
      subject,
      title,
    };
  });
  return result;
};

// 取得主題單字
export const handleGetSubjectWords = async (subject: string, userId: string): Promise<WordsSubject[]> => {
  const { isDaily } = await checkDailyWordsTaken(userId);
  if (isDaily || !subject) {
    return handleGetDailyWords(userId);
  }
  const wordIds: string[] = [];
  const data: WordsSubject[] = [];
  // 單字筆數
  const WORD_COUNT = 10;
  // 總主題
  const totalSubject = await handleGetSubjectCategory();
  // 剩下的主題
  let subjects = totalSubject.map((item) => item.subject).filter((item) => item !== subject);
  // 可嘗試次數(避免無限while)
  let attempts = totalSubject.length + 1;
  // 當前主題
  let currentSubject = subject;
  // 用來存放查找完的單字
  let result: WordQueryResult[] = [];

  do {
    // 需要的筆數
    const needCount = WORD_COUNT - result.length;
    if (needCount === 0) {
      break;
    }
    if (!currentSubject && subjects.length === 0) {
      break;
    }

    const res = await findSubjectWords(userId, currentSubject, needCount);
    result.push(...res);
    currentSubject = handleRandomSubject(subjects);
    // 扣除當前的主題
    subjects = subjects.filter((item) => item !== currentSubject);
    // 扣除嘗試次數
    attempts -= 1;
  } while (result.length < WORD_COUNT && attempts > 0);

  if (result.length !== WORD_COUNT) {
    throw new ApiError('伺服器錯誤請稍後再試', { statusCode: 500 });
  }

  result.forEach((item: WordQueryResult) => {
    const { id, word, pronunciation, category } = item;
    const { category_setting } = category!;
    const { title, subject } = category_setting;
    wordIds.push(id);
    data.push({
      id,
      word,
      pronunciation: pronunciation ?? '',
      category: subject,
      categoryName: title,
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
          category_setting: {
            select: {
              title: true,
              subject: true,
            },
          },
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
    const { category_setting } = category!;
    const { title, subject } = category_setting;
    return {
      id,
      word,
      pronunciation: pronunciation ?? '',
      category: subject,
      categoryName: title,
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
const saveDailyWord = async (userId: string, wordIds: string[]): Promise<void> => {
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
export const handleSaveLearnedWord = async (userId: string, wordId: string | string[]): Promise<void> => {
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
export const handleDeleteLearnedWord = async (userId: string, wordId: string): Promise<void> => {
  await prisma.words_storage.delete({
    where: {
      user_id_word_id: {
        user_id: userId,
        word_id: wordId,
      },
    },
  });
};

// 取得已學單字
export const handleGetLearnedWords = async (userId: string, itemPerPage?: number, page?: number): Promise<LearnedWord[]> => {
  const skip = itemPerPage && page ? (page - 1) * itemPerPage : undefined;
  const res = await prisma.words_storage.findMany({
    select: {
      word_id: true,
      learn_at: true,
      favorite: true,
      words: {
        select: {
          word: true,
          pronunciation: true,
          category: {
            select: {
              category_setting: {
                select: {
                  title: true,
                  subject: true,
                },
              },
            },
          },
        },
      },
    },
    where: {
      user_id: userId,
    },
    orderBy: {
      learn_at: 'asc',
    },
    skip: skip,
    take: itemPerPage,
  });

  const result = res.map((item) => {
    const { word_id, learn_at, words, favorite } = item;
    const { word, pronunciation, category } = words;
    const { category_setting } = category!;
    const { title, subject } = category_setting;
    return {
      favorite,
      wordId: word_id,
      learnAt: learn_at!,
      word,
      pronunciation: pronunciation ?? '',
      category: subject,
      categoryName: title,
    };
  });
  return result;
};

// 取得已學單字數量
export const handleGetLearnedWordCount = async (userId: string): Promise<LearnedWordCount> => {
  const res = await prisma.words_storage.count({
    where: {
      user_id: userId,
    },
  });
  return {
    count: res,
  };
};

// 改變我的最愛狀態
export const handleChangeFavorite = async (userId: string, wordId: string, status: boolean): Promise<void> => {
  await prisma.words_storage.updateMany({
    where: {
      user_id: userId,
      word_id: wordId,
    },
    data: {
      favorite: status,
    },
  });
};

// 取得我的最愛單字
export const handleGetFavorite = async (userId: string) => {
  const result = await prisma.words_storage.findMany({
    select: {
      words: {
        select: {
          word: true,
          id: true,
          pronunciation: true,
        },
      },
    },
    where: {
      user_id: userId,
      favorite: true,
    },
  });

  return result.map((item) => {
    return {
      ...item.words,
      pronunciation: item.words.pronunciation ?? '',
    };
  });
};
