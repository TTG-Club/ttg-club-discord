import type { TName, TSource } from './BaseTypes.js';

export interface TFeatLink {
  name: TName;
  url: string;
  requirements: string;
  homebrew?: boolean;
}

export interface TFeatItem {
  name: TName;
  requirements: string;
  description: string;
  source: TSource;
  homebrew?: boolean;
}
