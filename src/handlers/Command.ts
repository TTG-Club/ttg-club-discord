import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';

import commands from '../commands/index.js';
import { useConfig } from '../utils/useConfig.js';
import { useHelpers } from '../utils/useHelpers.js';

import type {
  Client,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

const { TOKEN, CLIENT_ID } = useConfig();

export default (client: Client) => {
  const { color } = useHelpers();

  const slashCommands: Array<
    SlashCommandBuilder | SlashCommandOptionsOnlyBuilder
  > = [];

  for (const group of commands) {
    for (const command of group) {
      slashCommands.push(command.command);
      client.slashCommands.set(command.command.name, command);
    }
  }

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  rest
    .put(Routes.applicationCommands(CLIENT_ID), {
      body: slashCommands.map((command) => command.toJSON()),
    })
    .then((data) => {
      if (!Array.isArray(data)) {
        throw new TypeError('Invalid response from Discord API');
      }

      // eslint-disable-next-line no-console
      console.log(
        color(
          'text',
          `🔥 Successfully loaded ${color(
            'variable',
            String(data.length),
          )} slash command(s)`,
        ),
      );

      // console.log(color('text', `🔥 Successfully loaded ${ color('variable', commands.length) } command(s)`));
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log(e);
    });
};
