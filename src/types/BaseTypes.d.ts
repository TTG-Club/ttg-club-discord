export interface TNameValue<T = string> {
  name: string;
  value: T;
}

export interface TName {
  rus: string;
  eng: string;
}

export interface TSource {
  shortName: string;
  name: string;
  homebrew?: boolean;
  page?: number;
}

export interface TClassBadge {
  name: string;
  url: string;
  icon: string;
}

export interface TSubclassBadge {
  name: string;
  url: string;
  class: string;
}

export interface TRaceBadge {
  name: string;
  url: string;
}

export interface TPrice {
  dmg: string;
  xge: string;
}

export interface TType {
  name: string;
  order: number;
}
