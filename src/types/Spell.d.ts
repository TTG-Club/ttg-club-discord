import type {
  TClassBadge,
  TName,
  TRaceBadge,
  TSource,
  TSubclassBadge,
} from './BaseTypes.js';

export interface TSpellLink {
  name: TName;
  level: number;
  school: string;
  additionalType?: string;
  components: TSpellLinkComponents;
  url: string;
  source: TSource;
  concentration?: boolean;
  ritual?: boolean;
}

export interface TSpellLinkComponents {
  v?: boolean;
  s?: boolean;
  m?: boolean;
}

export interface TSpellItemComponents {
  v?: boolean;
  s?: boolean;
  m?: string;
}

export interface TSpellItem {
  name: TName;
  level: number;
  school: string;
  additionalType?: string;
  components: TSpellItemComponents;
  url: string;
  source: TSource;
  range: string;
  duration: string;
  time: string;
  classes: TClassBadge[];
  subclasses?: TSubclassBadge[];
  description: string;
  concentration?: boolean;
  ritual?: boolean;
  races?: TRaceBadge[];
  upper?: string;
}
