import type { TClassBadge, TName, TSource } from './BaseTypes.js';

export interface TOptionItem {
  name: TName;
  requirements: string;
  description: string;
  source: TSource;
  classes: TClassBadge[];
  homebrew?: boolean;
}

export interface TOptionLink {
  name: TName;
  url: string;
  homebrew?: boolean;
}
