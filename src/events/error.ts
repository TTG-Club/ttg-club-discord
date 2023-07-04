import type { BotEvent } from '../types';
import type { ErrorEvent } from 'discord.js';
import * as process from 'node:process';

const eventError: BotEvent = {
  name: 'error',
  once: false,
  execute: (err: ErrorEvent) => {
    // eslint-disable-next-line no-console
    console.error(err);

    process.exit(1);
  }
};

export default eventError;
