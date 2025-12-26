import type { TBookType, TName, TSource, TType } from './BaseTypes.js';

export interface TBookLink {
  name: TName;
  url: string;
  type: TBookType;
  source: TSource;
  year?: number;
}

export interface TBookItem {
  name: TName;
  url: string;
  type: TType;
  description?: string;
  source: TSource;
  year?: number;
}
