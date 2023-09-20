import type { TName, TSource } from './BaseTypes.js';

export type TEquipmentLink = {
  name: TName;
  url: string;
  homebrew?: boolean;
};

export type TEquipmentItem = {
  name: TName;
  price?: string;
  source: TSource;
  weight?: number;
  description?: string;
  categories: string[];
  homebrew?: boolean;
};
