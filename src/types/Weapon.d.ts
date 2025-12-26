import type { TName, TSource, TType } from './BaseTypes.js';

export interface TWeaponLink {
  name: TName;
  url: string;
  type: TType;
  damage: TWeaponDamage;
  price: string;
  homebrew?: boolean;
}

export interface TWeaponDamage {
  dice?: string;
  type: string;
}

export interface TWeaponItem {
  name: TName;
  type: TType;
  damage: TWeaponDamage;
  price: string;
  source: TSource;
  weight: number;
  description?: string;
  properties: TWeaponProperty[];
  homebrew?: boolean;
  special?: string;
}

export interface TWeaponProperty {
  name: string;
  url: string;
  description: string;
  distance?: string;
  twoHandDice?: string;
}
