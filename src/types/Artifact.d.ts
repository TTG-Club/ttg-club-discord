import type {
  TName, TPrice, TSource, TType
} from './BaseTypes';

export type TArtifactLink = {
  name: TName;
  url: string;
  type: TType;
  source: TSource;
  rarity: TArtifactRarity;
  homebrew?: boolean;
}

export type TArtifactRarity = {
  type: string;
  name: string;
  short: string;
}

export type TArtifactItem = {
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
