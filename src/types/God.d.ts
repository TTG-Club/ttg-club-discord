import type { TName, TSource } from './BaseTypes.js';

export interface TGodLink {
  name: TName;
  url: string;
  alignment: string;
  shortAlignment: string;
  homebrew?: boolean;
}

export interface TGodItem {
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
