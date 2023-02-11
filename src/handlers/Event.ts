import type { Client } from 'discord.js';

import events from '../events';
import { useHelpers } from '../utils/useHelpers';

export default (client: Client) => {
  const { color } = useHelpers();

  for (const event of events) {
    event.once
      ? client.once(event.name, (...args) => event.execute(...args))
      : client.on(event.name, (...args) => event.execute(...args));
    console.log(color('text', `🌠 Successfully loaded event ${ color('variable', event.name) }`));
  }
};
