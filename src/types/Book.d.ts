import type { TName, TSource } from './BaseTypes';

export type TBookLink = {
  name: TName;
  url: string;
  type: TBookType;
  source: TSource;
  year?: number;
}

export type TBookType = {
  name: string;
  order: number;
}

export type TBookItem = {
  name: TName;
  url: string;
  type: TBookType;
  description?: string;
  source: TSource;
  year?: number;
}
