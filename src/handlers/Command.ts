import { REST } from '@discordjs/rest';
import type { Client, SlashCommandBuilder } from 'discord.js';
import { Routes } from 'discord.js';

import commands from '../commands';
import { useConfig } from '../utils/useConfig';
import { useHelpers } from '../utils/useHelpers';

const { TOKEN, CLIENT_ID } = useConfig();

export default (client: Client) => {
  const { color } = useHelpers();
  const slashCommands: SlashCommandBuilder[] = [];

  for (const group of commands) {
    for (const command of group) {
      slashCommands.push(command.command);
      client.slashCommands.set(command.command.name, command);
    }
  }

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  rest
    .put(Routes.applicationCommands(CLIENT_ID), {
      body: slashCommands.map(command => command.toJSON())
    })
    .then((data: any) => {
      // eslint-disable-next-line no-console
      console.log(color('text', `🔥 Successfully loaded ${ color('variable', data.length) } slash command(s)`));

      // console.log(color('text', `🔥 Successfully loaded ${ color('variable', commands.length) } command(s)`));
    })
    .catch(e => {
      // eslint-disable-next-line no-console
      console.log(e);
    });
};
