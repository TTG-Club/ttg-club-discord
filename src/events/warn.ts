import { Events } from 'discord.js';

import type { BotEvent } from '../types.js';

function isErrorEvent(value: unknown): value is ErrorEvent {
  return value instanceof ErrorEvent;
}

const eventWarn: BotEvent = {
  name: Events.Warn,
  once: false,
  execute: (...args: unknown[]) => {
    const warn = args[0];

    if (!isErrorEvent(warn)) {
      console.warn('Warn:', warn);

      process.exit(1);
    }

    console.warn('Warn:', warn);

    process.exit(1);
  },
};

export default eventWarn;
