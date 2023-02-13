import type { TName, TSource } from './BaseTypes';

export type TItemLink = {
  name: TName;
  url: string;
  homebrew?: boolean;
}

export type TItemItem = {
  name: TName;
  price?: string;
  source: TSource;
  weight?: number;
  description?: string;
  categories: string[];
  homebrew?: boolean;
}
