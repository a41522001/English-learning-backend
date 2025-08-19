// words
export interface SubjectCategory {
  bgColor: string;
  hoverColor: string;
  iconColor: string;
  content: string;
  icon: string;
  subject: string;
  title: string;
}
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
export interface LearnedWord {
  wordId: string;
  learnAt: Date;
  word: string;
  pronunciation?: string;
  category: string;
  categoryName: string;
  favorite: boolean;
}
export interface LearnedWordCount {
  count: number;
}
