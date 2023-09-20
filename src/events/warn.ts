import type { BotEvent } from '../types.js';

const eventWarn: BotEvent = {
  name: 'warn',
  once: false,
  execute: (warn: ErrorEvent) => {
    // eslint-disable-next-line no-console
    console.warn('Warn:', warn);

    process.exit(1);
  }
};

export default eventWarn;
