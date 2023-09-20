import type { BotEvent } from '../types.js';

const eventError: BotEvent = {
  name: 'error',
  once: false,
  execute: (err: ErrorEvent) => {
    // eslint-disable-next-line no-console
    console.error('Error:', err);

    process.exit(1);
  }
};

export default eventError;
