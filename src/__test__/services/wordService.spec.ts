import { describe, it, expect, vi } from 'vitest';
import { WordService } from '../../services/wordService';
import type { PrismaClient } from '@prisma/client';

// #region handleGetSubjectCategory
describe('handleGetSubjectCategory', () => {
  it('取得主題類別', async () => {
    const prismaReturn = [
      {
        bg_color: 'bgColor-1',
        content: 'context-1',
        hover_color: 'hoverColor-1',
        icon: 'icon-1',
        icon_color: 'iconColor-1',
        subject: 'subject-1',
        title: 'title-1',
      },
      {
        bg_color: 'bgColor-2',
        content: 'context-2',
        hover_color: 'hoverColor-2',
        icon: 'icon-2',
        icon_color: 'iconColor-2',
        subject: 'subject-2',
        title: 'title-2',
      },
    ];

    const expected = [
      {
        bgColor: 'bgColor-1',
        hoverColor: 'hoverColor-1',
        iconColor: 'iconColor-1',
        content: 'context-1',
        icon: 'icon-1',
        subject: 'subject-1',
        title: 'title-1',
      },
      {
        bgColor: 'bgColor-2',
        hoverColor: 'hoverColor-2',
        iconColor: 'iconColor-2',
        content: 'context-2',
        icon: 'icon-2',
        subject: 'subject-2',
        title: 'title-2',
      },
    ];
    const findMany = vi.fn().mockResolvedValue(prismaReturn);
    const prismaMock = {
      category_setting: {
        findMany,
      },
    } as unknown as PrismaClient;
    const wordService = new WordService(prismaMock);
    const actual = await wordService.handleGetSubjectCategory();
    expect(actual).toEqual(expected);
    expect(findMany).toHaveBeenCalledTimes(1);
  });
});
// #endregion

// #region checkDailyWordsTaken
describe('checkDailyWordsTaken', () => {
  it('今天沒拿過每日單字', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const prismaMock = {
      words_daily: {
        findFirst,
      },
    } as unknown as PrismaClient;
    const wordService = new WordService(prismaMock);
    const userId = 'user-1';
    const actual = await wordService.checkDailyWordsTaken(userId);
    expect(actual.isDaily).toEqual(false);
    expect(findFirst).toHaveBeenCalledTimes(1);
  });
  it('今天拿過每日單字', async () => {
    const findFirst = vi.fn().mockResolvedValue({});
    const prismaMock = {
      words_daily: {
        findFirst,
      },
    } as unknown as PrismaClient;
    const wordService = new WordService(prismaMock);
    const userId = 'user-1';
    const actual = await wordService.checkDailyWordsTaken(userId);
    expect(actual.isDaily).toEqual(true);
    expect(findFirst).toHaveBeenCalledTimes(1);
  });
});
// #endregion

// #region handleGetDailyWords
describe('handleGetDailyWords', () => {
  it('使用者未學過該單字 -> learned 為 false', async () => {
    const mockReturn = [
      {
        id: '1',
        word: 'meat',
        pronunciation: null,
        category: {
          category_setting: {
            subject: 'food',
            title: '食物',
          },
        },
        words_storage: [],
      },
    ];
    const findMany = vi.fn().mockResolvedValue(mockReturn);
    const prismaMock = {
      words: {
        findMany,
      },
    } as unknown as PrismaClient;
    const expected = [
      {
        id: '1',
        word: 'meat',
        pronunciation: '',
        category: 'food',
        categoryName: '食物',
        learned: false,
      },
    ];
    const wordService = new WordService(prismaMock);
    const userId = 'user-1';
    const actual = await wordService.handleGetDailyWords(userId);
    expect(actual).toEqual(expected);
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  it('使用者已學過該單字 -> learned 為 true', async () => {
    const mockReturn = [
      {
        id: '1',
        word: 'meat',
        pronunciation: null,
        category: {
          category_setting: {
            subject: 'food',
            title: '食物',
          },
        },
        words_storage: [{ word_id: 'w-1' }],
      },
    ];
    const findMany = vi.fn().mockResolvedValue(mockReturn);
    const prismaMock = {
      words: {
        findMany,
      },
    } as unknown as PrismaClient;
    const expected = [
      {
        id: '1',
        word: 'meat',
        pronunciation: '',
        category: 'food',
        categoryName: '食物',
        learned: true,
      },
    ];
    const wordService = new WordService(prismaMock);
    const userId = 'user-1';
    const actual = await wordService.handleGetDailyWords(userId);
    expect(actual).toEqual(expected);
    expect(findMany).toHaveBeenCalledTimes(1);
  });
});
// #endregion

// #region handleGetWordExample
describe('handleGetWordExample', () => {
  it('取得未知詞性單字例句', async () => {
    const prismaReturn = [
      {
        example_sentence_en: 'test-1',
        example_sentence_zh: '測試1',
        mean_zh: '測試',
        part_of_speech: 'other',
      },
    ];
    const expected = [
      {
        exampleSentenceEn: 'test-1',
        exampleSentenceZn: '測試1',
        meanZh: '測試',
        partOfSpeech: '未知',
      },
    ];
    const findMany = vi.fn().mockResolvedValue(prismaReturn);
    const prismaMock = {
      word_mean: {
        findMany,
      },
    } as unknown as PrismaClient;
    const wordId = 'word-id';
    const wordService = new WordService(prismaMock);
    const actual = await wordService.handleGetWordExample(wordId);
    expect(actual).toEqual(expected);
    expect(findMany).toHaveBeenCalledTimes(1);
  });
  it('取得正確單字例句', async () => {
    const prismaReturn = [
      {
        example_sentence_en: 'test-1',
        example_sentence_zh: '測試1',
        mean_zh: '測試',
        part_of_speech: 'noun',
      },
    ];
    const expected = [
      {
        exampleSentenceEn: 'test-1',
        exampleSentenceZn: '測試1',
        meanZh: '測試',
        partOfSpeech: '名詞',
      },
    ];
    const findMany = vi.fn().mockResolvedValue(prismaReturn);
    const prismaMock = {
      word_mean: {
        findMany,
      },
    } as unknown as PrismaClient;
    const wordId = 'word-id';
    const wordService = new WordService(prismaMock);
    const actual = await wordService.handleGetWordExample(wordId);
    expect(actual).toEqual(expected);
    expect(findMany).toHaveBeenCalledTimes(1);
  });
});
// #endregion

// #region handleGetSubjectWords
describe('handleGetSubjectWords', () => {
  it('已拿過每日單字 -> 走 daily 分支', async () => {
    const mockReturn = [
      {
        id: '1',
        word: 'meat',
        pronunciation: null,
        category: {
          category_setting: {
            subject: 'food',
            title: '食物',
          },
        },
        words_storage: [
          {
            word_id: 'word-id',
          },
        ],
      },
    ];
    const findFirst = vi.fn().mockResolvedValue({});
    const findMany = vi.fn().mockResolvedValue(mockReturn);
    const prismaMock = {
      words_daily: {
        findFirst,
      },
      words: {
        findMany,
      },
    } as unknown as PrismaClient;
    const expected = [
      {
        id: '1',
        word: 'meat',
        pronunciation: '',
        category: 'food',
        categoryName: '食物',
        learned: true,
      },
    ];
    const wordService = new WordService(prismaMock);
    const userId = 'user-1';
    const actual = await wordService.handleGetSubjectWords('test', userId);
    expect(actual).toEqual(expected);
    expect(findFirst).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledTimes(1);
  });
  it('subject 為空字串 -> 走 daily 分支', async () => {
    const mockReturn = [
      {
        id: '1',
        word: 'meat',
        pronunciation: null,
        category: {
          category_setting: {
            subject: 'food',
            title: '食物',
          },
        },
        words_storage: [
          {
            word_id: 'word-id',
          },
        ],
      },
    ];
    const findFirst = vi.fn().mockResolvedValue(null);
    const findMany = vi.fn().mockResolvedValue(mockReturn);
    const prismaMock = {
      words_daily: {
        findFirst,
      },
      words: {
        findMany,
      },
    } as unknown as PrismaClient;
    const expected = [
      {
        id: '1',
        word: 'meat',
        pronunciation: '',
        category: 'food',
        categoryName: '食物',
        learned: true,
      },
    ];
    const wordService = new WordService(prismaMock);
    const userId = 'user-1';
    const actual = await wordService.handleGetSubjectWords('', userId);
    expect(actual).toEqual(expected);
    expect(findFirst).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledTimes(1);
  });
  it('主題單字一次湊滿 10 個 -> 回傳 10 筆並儲存每日單字', async () => {
    const wordsDailyFindFirstFn = vi.fn().mockResolvedValue(null);
    const wordDailyCreateManyFn = vi.fn();
    const categorySettingFindManyFn = vi.fn().mockResolvedValue([
      {
        subject: 'food',
        title: '食物',
        bg_color: '',
        hover_color: '',
        icon_color: '',
        icon: '',
        content: '',
      },
      {
        subject: 'life',
        title: '生活',
        bg_color: '',
        hover_color: '',
        icon_color: '',
        icon: '',
        content: '',
      },
    ]);
    const wordsFindManyFn = vi.fn().mockResolvedValue(
      Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        word: `word-${i + 1}`,
        pronunciation: null,
        category: {
          category_setting: { subject: 'food', title: '食物' },
        },
      })),
    );

    const prismaMock = {
      words_daily: {
        findFirst: wordsDailyFindFirstFn,
        createMany: wordDailyCreateManyFn,
      },
      words: {
        findMany: wordsFindManyFn,
      },
      category_setting: {
        findMany: categorySettingFindManyFn,
      },
    } as unknown as PrismaClient;
    const wordService = new WordService(prismaMock);
    const userId = 'user-1';
    const actual = await wordService.handleGetSubjectWords('test', userId);
    expect(actual).toHaveLength(10);
    expect(wordsDailyFindFirstFn).toHaveBeenCalledOnce();
    expect(wordDailyCreateManyFn).toHaveBeenCalledOnce();
    expect(wordsFindManyFn).toHaveBeenCalledOnce();
    expect(categorySettingFindManyFn).toHaveBeenCalledOnce();
  });
  it('主題單字兩次湊滿 10 個 -> 回傳 10 筆並儲存每日單字', async () => {
    const wordsDailyFindFirstFn = vi.fn().mockResolvedValue(null);
    const wordDailyCreateManyFn = vi.fn();
    const categorySettingFindManyFn = vi.fn().mockResolvedValue([
      {
        subject: 'food',
        title: '食物',
        bg_color: '',
        hover_color: '',
        icon_color: '',
        icon: '',
        content: '',
      },
      {
        subject: 'life',
        title: '生活',
        bg_color: '',
        hover_color: '',
        icon_color: '',
        icon: '',
        content: '',
      },
    ]);
    const wordsFindManyFn = vi
      .fn()
      .mockResolvedValueOnce(
        Array.from({ length: 5 }, (_, i) => ({
          id: `${i + 1}`,
          word: `word-${i + 1}`,
          pronunciation: null,
          category: {
            category_setting: { subject: 'food', title: '食物' },
          },
        })),
      )
      .mockResolvedValueOnce(
        Array.from({ length: 5 }, (_, i) => ({
          id: `${i + 5 + 1}`,
          word: `word-${i + 5 + 1}`,
          pronunciation: null,
          category: {
            category_setting: { subject: 'food', title: '食物' },
          },
        })),
      );

    const prismaMock = {
      words_daily: {
        findFirst: wordsDailyFindFirstFn,
        createMany: wordDailyCreateManyFn,
      },
      words: {
        findMany: wordsFindManyFn,
      },
      category_setting: {
        findMany: categorySettingFindManyFn,
      },
    } as unknown as PrismaClient;
    const wordService = new WordService(prismaMock);
    const userId = 'user-1';
    const actual = await wordService.handleGetSubjectWords('test', userId);
    expect(actual).toHaveLength(10);
    expect(wordsDailyFindFirstFn).toHaveBeenCalledOnce();
    expect(wordDailyCreateManyFn).toHaveBeenCalledOnce();
    expect(wordsFindManyFn).toHaveBeenCalledTimes(2);
    expect(categorySettingFindManyFn).toHaveBeenCalledOnce();
  });
  it('主題單字湊不到10個 -> 回傳例外', async () => {
    const wordsDailyFindFirstFn = vi.fn().mockResolvedValue(null);
    const wordDailyCreateManyFn = vi.fn();
    const categorySettingFindManyFn = vi.fn().mockResolvedValue([
      {
        subject: 'food',
        title: '食物',
        bg_color: '',
        hover_color: '',
        icon_color: '',
        icon: '',
        content: '',
      },
      {
        subject: 'life',
        title: '生活',
        bg_color: '',
        hover_color: '',
        icon_color: '',
        icon: '',
        content: '',
      },
    ]);
    const wordsFindManyFn = vi.fn().mockResolvedValue([]);
    const prismaMock = {
      words_daily: {
        findFirst: wordsDailyFindFirstFn,
        createMany: wordDailyCreateManyFn,
      },
      words: {
        findMany: wordsFindManyFn,
      },
      category_setting: {
        findMany: categorySettingFindManyFn,
      },
    } as unknown as PrismaClient;
    const wordService = new WordService(prismaMock);
    const userId = 'user-1';
    await expect(wordService.handleGetSubjectWords('test', userId)).rejects.toThrow(
      '伺服器錯誤請稍後再試',
    );
    expect(wordDailyCreateManyFn).not.toHaveBeenCalled();
    expect(wordsFindManyFn).toHaveBeenCalled();
  });
});
// #endregion

// #region handleSaveLearnedWord
describe('handleSaveLearnedWord', () => {
  it('wordId為字串陣列', async () => {
    const createMany = vi.fn();
    const create = vi.fn();
    const prismaMock = {
      words_storage: {
        createMany,
        create,
      },
    } as unknown as PrismaClient;
    const userId = 'user-id';
    const wordId = ['1', '2', '3'];
    const wordService = new WordService(prismaMock);
    await wordService.handleSaveLearnedWord(userId, wordId);
    expect(createMany).toHaveBeenCalledTimes(1);
    expect(create).not.toHaveBeenCalled();
  });
  it('wordId為一般字串', async () => {
    const createMany = vi.fn();
    const create = vi.fn();
    const prismaMock = {
      words_storage: {
        createMany,
        create,
      },
    } as unknown as PrismaClient;
    const userId = 'user-id';
    const wordId = '1';
    const wordService = new WordService(prismaMock);
    await wordService.handleSaveLearnedWord(userId, wordId);
    expect(createMany).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledTimes(1);
  });
});
// #endregion

// #region handleDeleteLearnedWord
describe('handleDeleteLearnedWord', () => {
  it('刪除成功', async () => {
    const deleteFn = vi.fn();
    const prismaMock = {
      words_storage: {
        delete: deleteFn,
      },
    } as unknown as PrismaClient;
    const userId = 'user-id';
    const wordId = '1';
    const wordService = new WordService(prismaMock);
    await wordService.handleDeleteLearnedWord(userId, wordId);
    expect(deleteFn).toHaveBeenCalledOnce();
    expect(deleteFn).toHaveBeenCalledWith({
      where: {
        user_id_word_id: {
          user_id: 'user-id',
          word_id: '1',
        },
      },
    });
  });
});
// #endregion

// #region handleGetLearnedWordCount
describe('handleGetLearnedWordCount', () => {
  it('回傳已學單字的數量', async () => {
    const countFn = vi.fn().mockResolvedValue(3);
    const prismaMock = {
      words_storage: {
        count: countFn,
      },
    } as unknown as PrismaClient;
    const expected = 3;
    const userId = 'user-id';
    const wordService = new WordService(prismaMock);
    const actual = await wordService.handleGetLearnedWordCount(userId);
    expect(countFn).toHaveBeenCalledOnce();
    expect(actual.count).toBe(expected);
    expect(countFn).toHaveBeenCalledWith({
      where: {
        user_id: 'user-id',
      },
    });
  });
});
// #endregion

// #region handleChangeFavorite
describe('handleChangeFavorite', () => {
  it('改變我的最愛狀態', async () => {
    const updateManyFn = vi.fn();
    const prismaMock = {
      words_storage: {
        updateMany: updateManyFn,
      },
    } as unknown as PrismaClient;
    const userId = 'user-id';
    const wordId = '1';
    const status = false;
    const wordService = new WordService(prismaMock);
    await wordService.handleChangeFavorite(userId, wordId, status);
    expect(updateManyFn).toHaveBeenCalledOnce();
    expect(updateManyFn).toHaveBeenCalledWith({
      where: {
        user_id: 'user-id',
        word_id: '1',
      },
      data: {
        favorite: false,
      },
    });
  });
});
// #endregion

// #region handleGetFavorite
describe('handleGetFavorite', () => {
  it('取得我的最愛單字', async () => {
    const findManyFnReturn = [
      {
        words: {
          id: '1',
          word: 'meat',
          pronunciation: null,
        },
      },
      {
        words: {
          id: '2',
          word: 'sheep',
          pronunciation: null,
        },
      },
      {
        words: {
          id: '3',
          word: 'paper',
          pronunciation: null,
        },
      },
    ];
    const expected = [
      {
        id: '1',
        word: 'meat',
        pronunciation: '',
      },
      {
        id: '2',
        word: 'sheep',
        pronunciation: '',
      },
      {
        id: '3',
        word: 'paper',
        pronunciation: '',
      },
    ];
    const findManyFn = vi.fn().mockResolvedValue(findManyFnReturn);
    const prismaMock = {
      words_storage: {
        findMany: findManyFn,
      },
    } as unknown as PrismaClient;
    const userId = 'user-id';
    const wordService = new WordService(prismaMock);
    const actual = await wordService.handleGetFavorite(userId);
    expect(actual).toEqual(expected);
    expect(findManyFn).toHaveBeenCalledOnce();
    expect(findManyFn).toHaveBeenCalledWith({
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
        user_id: 'user-id',
        favorite: true,
      },
    });
  });
});
// #endregion

// #region handleGetLearnedWords
describe('handleGetLearnedWords', () => {
  it('取得已學單字: 不帶分頁參數', async () => {
    const expected = [
      {
        wordId: '1',
        learnAt: new Date('2026-04-15'),
        word: 'meat',
        pronunciation: '',
        category: 'food',
        categoryName: '食物',
        favorite: false,
      },
    ];
    const findManyFnReturn = [
      {
        word_id: '1',
        learn_at: new Date('2026-04-15'),
        favorite: false,
        words: {
          word: 'meat',
          pronunciation: null,
          category: {
            category_setting: {
              subject: 'food',
              title: '食物',
            },
          },
        },
      },
    ];
    const findManyFn = vi.fn().mockResolvedValue(findManyFnReturn);
    const prismaMock = {
      words_storage: {
        findMany: findManyFn,
      },
    } as unknown as PrismaClient;
    const userId = 'user-id';
    const wordService = new WordService(prismaMock);
    const actual = await wordService.handleGetLearnedWords(userId);
    expect(actual).toEqual(expected);
    expect(findManyFn).toHaveBeenCalledOnce();
    expect(findManyFn).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          user_id: userId,
        },
        skip: undefined,
        take: undefined,
      }),
    );
  });
  it('取得已學單字, 參數: page = 3, itemPerPage = 10', async () => {
    const expected = [
      {
        wordId: '1',
        learnAt: new Date('2026-04-15'),
        word: 'meat',
        pronunciation: '',
        category: 'food',
        categoryName: '食物',
        favorite: false,
      },
    ];
    const findManyFnReturn = [
      {
        word_id: '1',
        learn_at: new Date('2026-04-15'),
        favorite: false,
        words: {
          word: 'meat',
          pronunciation: null,
          category: {
            category_setting: {
              subject: 'food',
              title: '食物',
            },
          },
        },
      },
    ];
    const findManyFn = vi.fn().mockResolvedValue(findManyFnReturn);
    const prismaMock = {
      words_storage: {
        findMany: findManyFn,
      },
    } as unknown as PrismaClient;
    const userId = 'user-id';
    const wordService = new WordService(prismaMock);
    const actual = await wordService.handleGetLearnedWords(userId, 10, 3);
    expect(actual).toEqual(expected);
    expect(findManyFn).toHaveBeenCalledOnce();
    expect(findManyFn).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          user_id: userId,
        },
        skip: 20,
        take: 10,
      }),
    );
  });
});
// #endregion
