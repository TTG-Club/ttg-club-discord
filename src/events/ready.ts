import process from 'process';

import { Events } from 'discord.js';

import { useHelpers } from '../utils/useHelpers.js';

import type { BotEvent } from '../types.js';
import type { Client } from 'discord.js';

const eventReady: BotEvent = {
  name: Events.ClientReady,
  once: true,
  execute: (client: Client) => {
    const { color } = useHelpers();

    process.once('unhandledRejection', error => {
      console.error('UnhandledRejection:', error);

      process.exit(1);
    });

    process.once('uncaughtException', error => {
      console.error('UncaughtException:', error);

      process.exit(1);
    });

    // eslint-disable-next-line no-console
    console.log(
      color('text', `💪 Logged in as ${color('variable', client.user?.tag)}`)
    );
  }
};

export default eventReady;
