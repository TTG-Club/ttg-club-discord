import { Events } from 'discord.js';

import type { BotEvent } from '../types.js';

const eventWarn: BotEvent = {
  name: Events.Warn,
  once: false,
  execute: (...args: unknown[]) => {
    const warn = args[0] as ErrorEvent;

    console.warn('Warn:', warn);

    process.exit(1);
  },
};

export default eventWarn;
