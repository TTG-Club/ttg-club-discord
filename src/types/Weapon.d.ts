import type { TName, TSource, TType } from './BaseTypes.js';

export type TWeaponLink = {
  name: TName;
  url: string;
  type: TType;
  damage: TWeaponDamage;
  price: string;
  homebrew?: boolean;
};

export type TWeaponDamage = {
  dice?: string;
  type: string;
};

export type TWeaponItem = {
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
};

export type TWeaponProperty = {
  name: string;
  url: string;
  description: string;
  distance?: string;
  twoHandDice?: string;
};
