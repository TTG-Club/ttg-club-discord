import type {
  TName, TSource, TType
} from './BaseTypes';

export type TBookLink = {
  name: TName;
  url: string;
  type: TBookType;
  source: TSource;
  year?: number;
}

export type TBookItem = {
  name: TName;
  url: string;
  type: TType;
  description?: string;
  source: TSource;
  year?: number;
}
