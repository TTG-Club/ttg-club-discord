import events from '../events/index.js';
import { useHelpers } from '../utils/useHelpers.js';

import type { Client } from 'discord.js';

export default (client: Client) => {
  const { color } = useHelpers();

  for (const event of events) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }

    // eslint-disable-next-line no-console
    console.log(
      color(
        'text',
        `🌠 Successfully loaded event ${color('variable', event.name)}`
      )
    );
  }
};
