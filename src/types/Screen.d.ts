import type { TName, TSource } from './BaseTypes.js';

export interface TScreenGroupLink {
  name: TName;
  url: string;
  order: number;
  source: TSource;
  group?: string;
}

export interface TScreenGroup {
  name: TName;
  url: string;
  order: number;
  chields: TScreenLink[];
}

export interface TScreenLink {
  name: TName;
  url: string;
  order: number;
  source: TSource;
  icon: string;
  group: string;
}

export interface TScreenItem {
  name: TName;
  url: string;
  order: number;
  source: TSource;
  description: string;
  parent: TScreenLinkParent;
}

export interface TScreenLinkParent {
  name: TName;
  url: string;
  order: number;
}
