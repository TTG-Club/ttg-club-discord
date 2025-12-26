import type { TName, TSource } from './BaseTypes.js';

export interface TRuleLink {
  name: TName;
  url: string;
  source: TSource;
}

export interface TRuleItem {
  name: TName;
  source: TSource;
  description: string;
  type: string;
}
