import type { BotEvent } from '../types.js';

const eventUnhandledRejection: BotEvent = {
  name: 'unhandledRejection',
  once: false,
  execute: (err: ErrorEvent) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled promise rejection:', err);

    process.exit(1);
  }
};

export default eventUnhandledRejection;
