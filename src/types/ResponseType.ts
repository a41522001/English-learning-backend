// words
export interface WordsSubject {
  id: string;
  word: string;
  pronunciation: string;
  category: string;
  categoryName: string;
  learned: boolean;
}
export interface WordExample {
  exampleSentenceEn: string;
  exampleSentenceZn: string;
  meanZh: string;
  partOfSpeech: string;
}
export interface CheckDaily {
  isDaily: boolean;
}
export interface Userinfo {
  username: string;
  email: string;
  id: string;
  created_at: Date;
}
