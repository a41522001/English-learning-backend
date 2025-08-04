import { StringValue } from 'ms';

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
export interface Userinfo {
  id: string;
  username: string;
  email: string;
  created_at: Date;
}
export interface LoginResponse {
  access: string;
  refresh: string;
}
