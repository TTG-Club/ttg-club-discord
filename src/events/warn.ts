import { Events } from 'discord.js';

import type { BotEvent } from '../types.js';

const eventWarn: BotEvent = {
  name: Events.Warn,
  once: false,
  execute: (warn: ErrorEvent) => {
    // eslint-disable-next-line no-console
    console.warn('Warn:', warn);

    process.exit(1);
  }
};

export default eventWarn;
