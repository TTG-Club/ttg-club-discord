import type {
  TName, TPrice, TSource
} from './BaseTypes';

export type TArtifactLink = {
  name: TName;
  url: string;
  type: TArtifactType;
  source: TSource;
  rarity: TArtifactRarity;
  homebrew?: boolean;
}

export type TArtifactRarity = {
  type: string;
  name: string;
  short: string;
}

export type TArtifactType = {
  name: string;
  order: number;
}

export type TArtifactItem = {
  name: TName;
  type: TArtifactType;
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
