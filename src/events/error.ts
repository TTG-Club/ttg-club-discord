import { Events } from 'discord.js';

import type { BotEvent } from '../types.js';

const eventError: BotEvent = {
  name: Events.Error,
  once: false,
  execute: (err: ErrorEvent) => {
    // eslint-disable-next-line no-console
    console.error('Error:', err);

    process.exit(1);
  }
};

export default eventError;
