import { useHelpers } from '../utils/useHelpers.js';

import type { BotEvent } from '../types.js';
import type { Client } from 'discord.js';

const eventReady: BotEvent = {
  name: 'ready',
  once: true,
  execute: (client: Client) => {
    const { color } = useHelpers();

    // eslint-disable-next-line no-console
    console.log(
      color('text', `💪 Logged in as ${color('variable', client.user?.tag)}`)
    );
  }
};

export default eventReady;
