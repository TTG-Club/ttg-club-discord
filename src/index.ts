import {
  Client, Collection, GatewayIntentBits
} from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { Command, SlashCommand } from './types';

config();

const {
  Guilds, MessageContent, GuildMessages, GuildMembers
} = GatewayIntentBits;

const client = new Client({
  intents: [
    Guilds,
    MessageContent,
    GuildMessages,
    GuildMembers
  ]
});

client.slashCommands = new Collection<string, SlashCommand>();
client.commands = new Collection<string, Command>();
client.cooldowns = new Collection<string, number>();

const handlersDir = join(__dirname, './handlers');

readdirSync(handlersDir).forEach(handler => {
  require(`${ handlersDir }/${ handler }`)(client);
});

client.login(process.env.TOKEN).then();
