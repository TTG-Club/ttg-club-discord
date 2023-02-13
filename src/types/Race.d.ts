import type {
  TName, TSource, TType
} from './BaseTypes';

export type TRaceLink = {
  name: TName;
  url: string;
  abilities: TRaceAbility[];
  type: TType;
  source: TSource;
  image: string;
  subraces?: TRaceLinkSubrace[];
}

export type TRaceAbility = {
  key: string;
  name: string;
  shortName: string;
  value: number;
}

export type TRaceLinkSubrace = {
  name: TName;
  url: string;
  abilities: TRaceAbility[];
  type: TType;
  source: TSource;
  image: string;
}

export type TRaceItem = {
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

export type TRaceItemSkill = {
  name: string;
  description: string;
  opened?: boolean;
}

export type TRaceItemSpeed = {
  name?: string;
  value: number;
}

export type TRaceItemSubrace = {
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

export type TRaceItemSubraceSkill = {
  name: string;
  description: string;
  opened?: boolean;
  subrace?: boolean;
}
