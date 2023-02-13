import type { TName, TSource } from './BaseTypes';

export type TTraitLink = {
  name: TName;
  url: string;
  requirements: string;
  homebrew?: boolean;
}

export type TTraitItem = {
  name: TName;
  requirements: string;
  description: string;
  source: TSource;
  homebrew?: boolean;
}
