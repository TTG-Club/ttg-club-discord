import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Collection,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

export interface SlashCommand {
  command: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  cooldown?: number;
}

export interface BotEvent {
  name: string;
  once?: boolean | false;
  execute: (...args: unknown[]) => void | Promise<void>;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly TOKEN: string;
      readonly CLIENT_ID: string;
      readonly API_URL: string;
      readonly SITE_URL: string;
    }
  }
}

declare module 'discord.js' {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>;
    cooldowns: Collection<string, number>;
  }
}
