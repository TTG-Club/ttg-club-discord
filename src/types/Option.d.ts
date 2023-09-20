import type { TClassBadge, TName, TSource } from './BaseTypes.js';

export type TOptionItem = {
  name: TName;
  requirements: string;
  description: string;
  source: TSource;
  classes: TClassBadge[];
  homebrew?: boolean;
};

export type TOptionLink = {
  name: TName;
  url: string;
  homebrew?: boolean;
};
