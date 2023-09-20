import type { TName, TSource } from './BaseTypes.js';

export type TRuleLink = {
  name: TName;
  url: string;
  source: TSource;
};

export type TRuleItem = {
  name: TName;
  source: TSource;
  description: string;
  type: string;
};
