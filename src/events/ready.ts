import type { BotEvent } from '../types';
import type { Client } from 'discord.js';

import { useHelpers } from '../utils/useHelpers';

const eventReady: BotEvent = {
  name: 'ready',
  once: true,
  execute: (client: Client) => {
    const { color } = useHelpers();

    // eslint-disable-next-line no-console
    console.log(color('text', `💪 Logged in as ${ color('variable', client.user?.tag) }`));
  }
};

export default eventReady;
