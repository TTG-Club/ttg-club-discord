import type { TName, TSource } from './BaseTypes';

export type TGodLink = {
  name: TName;
  url: string;
  alignment: string;
  shortAlignment: string;
  homebrew?: boolean;
}

export type TGodItem = {
  name: TName;
  alignment: string;
  shortAlignment: string;
  description: string;
  rank: string;
  titles?: string[];
  symbol?: string;
  domains: string[];
  panteons: string[];
  images?: string[];
  source: TSource;
  homebrew?: boolean;
}
