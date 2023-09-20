import type { BotEvent } from '../types.js';

const eventShardDisconnect: BotEvent = {
  name: 'shardDisconnect',
  once: false,
  execute: (err: ErrorEvent) => {
    // eslint-disable-next-line no-console
    console.error('Shard Disconnect:', err);

    process.exit(1);
  }
};

export default eventShardDisconnect;
