import type { TName, TSource } from './BaseTypes.js';

export type TScreenGroupLink = {
  name: TName;
  url: string;
  order: number;
  source: TSource;
  group?: string;
};

export type TScreenGroup = {
  name: TName;
  url: string;
  order: number;
  chields: TScreenLink[];
};

export type TScreenLink = {
  name: TName;
  url: string;
  order: number;
  source: TSource;
  icon: string;
  group: string;
};

export type TScreenItem = {
  name: TName;
  url: string;
  order: number;
  source: TSource;
  description: string;
  parent: TScreenLinkParent;
};

export type TScreenLinkParent = {
  name: TName;
  url: string;
  order: number;
};
