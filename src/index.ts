import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ShardingManager } from 'discord.js';

import { useConfig } from './utils/useConfig.js';

const _dirname = dirname(fileURLToPath(import.meta.url));
const { TOKEN } = useConfig();

const manager = new ShardingManager(join(_dirname, 'bot.js'), {
  token: TOKEN,
  totalShards: 'auto',
});

// eslint-disable-next-line no-console
manager.on('shardCreate', (shard) => console.log(`Launched shard ${shard.id}`));

manager.spawn();
