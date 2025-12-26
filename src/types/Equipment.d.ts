import type { TName, TSource } from './BaseTypes.js';

export interface TEquipmentLink {
  name: TName;
  url: string;
  homebrew?: boolean;
}

export interface TEquipmentItem {
  name: TName;
  price?: string;
  source: TSource;
  weight?: number;
  description?: string;
  categories: string[];
  homebrew?: boolean;
}
