import type { TName, TSource, TType } from './BaseTypes.js';

export interface TRaceLink {
  name: TName;
  url: string;
  abilities: TRaceAbility[];
  type: TType;
  source: TSource;
  image: string;
  subraces?: TRaceLinkSubrace[];
}

export interface TRaceAbility {
  key: string;
  name: string;
  shortName: string;
  value: number;
}

export interface TRaceLinkSubrace {
  name: TName;
  url: string;
  abilities: TRaceAbility[];
  type: TType;
  source: TSource;
  image: string;
}

export interface TRaceItem {
  name: TName;
  abilities: TRaceAbility[];
  type: string;
  source: TSource;
  image: string;
  description: string;
  size: string;
  speed: TRaceItemSpeed[];
  images?: string[];
  skills: TRaceItemSkill[];
  subraces?: TRaceItemSubrace[];
  darkvision?: number;
}

export interface TRaceItemSkill {
  name: string;
  description: string;
  opened?: boolean;
}

export interface TRaceItemSpeed {
  name?: string;
  value: number;
}

export interface TRaceItemSubrace {
  name: TName;
  abilities: TRaceAbility[];
  type: string;
  source: TSource;
  image: string;
  description: string;
  size: string;
  speed: TRaceItemSpeed[];
  darkvision?: number;
  skills: TRaceItemSubraceSkill[];
}

export interface TRaceItemSubraceSkill {
  name: string;
  description: string;
  opened?: boolean;
  subrace?: boolean;
}
