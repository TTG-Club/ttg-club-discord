import type { BotEvent } from '../types.js';

const eventShardError: BotEvent = {
  name: 'shardError',
  once: false,
  execute: (err: ErrorEvent) => {
    // eslint-disable-next-line no-console
    console.error('Shard Error:', err);

    process.exit(1);
  }
};

export default eventShardError;
