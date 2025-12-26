import type { TName, TPrice, TSource, TType } from './BaseTypes.js';

export interface TArtifactLink {
  name: TName;
  url: string;
  type: TType;
  source: TSource;
  rarity: TArtifactRarity;
  homebrew?: boolean;
}

export type TArtifactRarityEnum =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'very-rare'
  | 'legendary'
  | 'artifact'
  | 'unknown'
  | 'varies';

export type TArtifactRarityShortEnum = 'O' | 'Н' | 'Р' | 'OР' | 'Л' | 'А' | '~';

export interface TArtifactRarity {
  type: TArtifactRarityEnum;
  name: string;
  short: TArtifactRarityShortEnum;
}

export interface TArtifactItem {
  name: TName;
  type: TType;
  source: TSource;
  rarity: TArtifactRarity;
  description: string;
  customization?: boolean;
  detailCustamization?: string[];
  cost?: TPrice;
  images?: string[];
  detailType?: string[];
  homebrew?: boolean;
}
