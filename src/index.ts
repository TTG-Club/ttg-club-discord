import type { SlashCommand } from './types';
import { Client, Collection } from 'discord.js';

import handlers from './handlers';
import { useConfig } from './utils/useConfig';

const client = new Client({
  intents: []
});

client.slashCommands = new Collection<string, SlashCommand>();
client.cooldowns = new Collection<string, number>();

for (let handler of handlers) {
  handler(client);
}

const { TOKEN } = useConfig();

client.login(TOKEN)
  .then();
