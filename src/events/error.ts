import { Events } from 'discord.js';

import type { BotEvent } from '../types.js';

function isErrorEvent(value: unknown): value is ErrorEvent {
  return value instanceof ErrorEvent;
}

const eventError: BotEvent = {
  name: Events.Error,
  once: false,
  execute: (...args: unknown[]) => {
    const err = args[0];

    if (!isErrorEvent(err)) {
      console.error('Error:', err);

      process.exit(1);
    }

    console.error('Error:', err);

    process.exit(1);
  },
};

export default eventError;
