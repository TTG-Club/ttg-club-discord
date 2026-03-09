import { Client, Collection } from 'discord.js';

import handlers from './handlers/index.js';
import { useConfig } from './utils/useConfig.js';

import type { SlashCommand } from './types.js';

const client = new Client({
  intents: [],
});

client.slashCommands = new Collection<string, SlashCommand>();
client.cooldowns = new Collection<string, number>();

for (const handler of handlers) {
  handler(client);
}

const { TOKEN } = useConfig();

client.login(TOKEN).catch((err) => {
  console.error(err);
  process.exit(1);
});
