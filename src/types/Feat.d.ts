import type { TName, TSource } from './BaseTypes.js';

export type TFeatLink = {
  name: TName;
  url: string;
  requirements: string;
  homebrew?: boolean;
};

export type TFeatItem = {
  name: TName;
  requirements: string;
  description: string;
  source: TSource;
  homebrew?: boolean;
};
