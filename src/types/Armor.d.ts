import type { TName, TSource, TType } from './BaseTypes.js';

export interface TArmorLink {
  name: TName;
  url: string;
  homebrew?: boolean;
  type: TType;
  armorClass: string;
  price: string;
}

export interface TArmorItem {
  name: TName;
  homebrew?: boolean;
  type: TType;
  armorClass: string;
  price: string;
  source: TSource;
  weight: number;
  description: string;
  disadvantage?: boolean;
  duration: string;
  requirement?: number;
}
