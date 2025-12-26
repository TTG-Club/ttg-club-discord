import { Events } from 'discord.js';

import type { BotEvent } from '../types.js';

const eventError: BotEvent = {
  name: Events.Error,
  once: false,
  execute: (...args: unknown[]) => {
    const err = args[0];

    console.error('Error:', err);
    process.exit(1);
  },
};

export default eventError;
