import type { Command, SlashCommand } from './types';
import {
  Client, Collection, GatewayIntentBits
} from 'discord.js';

import handlers from './handlers';
import { useConfig } from './utils/useConfig';

const {
  Guilds,
  MessageContent,
  GuildMessages,
  GuildMembers
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

for (let handler of handlers) {
  handler(client);
}

const { TOKEN } = useConfig();

client.login(TOKEN)
  .then();
