import type {
  AutocompleteInteraction,
  Collection,
  CommandInteraction,
  SlashCommandBuilder
} from 'discord.js';

export interface SlashCommand {
  command: SlashCommandBuilder | any;
  execute: (interaction: CommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  cooldown?: number;
}

export interface BotEvent {
  name: string;
  once?: boolean | false;
  execute: (...args) => void;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly TOKEN: string;
      readonly CLIENT_ID: string;
      readonly API_URL: string;
    }
  }
}

declare module 'discord.js' {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>;
    cooldowns: Collection<string, number>;
  }
}
