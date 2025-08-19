import { StringValue } from 'ms';
import { Request } from 'express';

export interface RequestCustom extends Request {
  userId?: string;
}
export interface TokenOption {
  secret: string;
  expire: StringValue | number;
}
export interface TokenOptions {
  access: TokenOption;
  refresh: TokenOption;
}
export interface TokenType {
  access: string;
  refresh: string;
}
export interface DecodedToken {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
}
export interface LoginResponse {
  access: string;
  refresh: string;
  isDaily: boolean;
}
export interface MappingPartOfSpeech {
  noun: string;
  verb: string;
  adjective: string;
  adverb: string;
  pronoun: string;
  preposition: string;
  numeral: string;
  determiner: string;
  'modal verb': string;
  conjunction: string;
  article: string;
  'auxiliary verb': string;
  particle: string;
  interjection: string;
  ordinal: string;
}
export interface WordQueryResult {
  id: string;
  word: string;
  pronunciation: string | null;
  category: {
    category_setting: {
      title: string;
      subject: string;
    };
  } | null;
}
