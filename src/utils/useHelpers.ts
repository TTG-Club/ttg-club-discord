import chalk from 'chalk';
import { PermissionFlagsBits } from 'discord.js';

import type {
  GuildMember,
  PermissionResolvable,
  TextChannel
} from 'discord.js';

export type colorType = 'text' | 'variable' | 'error';

export const useHelpers = () => {
  const themeColors: { [key in colorType]: string } = {
    text: '#ff8e4d',
    variable: '#3567C9',
    error: '#ff3333'
  };

  const getThemeColor = (color: colorType) =>
    Number(`0x${themeColors[color].substring(1)}`);

  const color = (colorName: colorType, message: any) =>
    chalk.hex(themeColors[colorName])(message);

  const checkPermissions = (
    member: GuildMember,
    permissions: Array<PermissionResolvable>
  ) => {
    const neededPermissions: PermissionResolvable[] = [];

    permissions.forEach(permission => {
      if (!member.permissions.has(permission))
        neededPermissions.push(permission);
    });
    if (neededPermissions.length === 0) return null;

    return neededPermissions.map(p => {
      if (typeof p === 'string') return p.split(/(?=[A-Z])/).join(' ');

      return Object.keys(PermissionFlagsBits)
        .find(k => Object(PermissionFlagsBits)[k] === p)
        ?.split(/(?=[A-Z])/)
        .join(' ');
    });
  };

  const sendTimedMessage = (
    message: string,
    channel: TextChannel,
    duration: number
  ) => {
    channel.send(message).then(m =>
      setTimeout(async () => {
        const resp = await channel.messages.fetch(m);

        return resp.delete();
      }, duration)
    );
  };

  return {
    themeColors,

    getThemeColor,
    color,
    checkPermissions,
    sendTimedMessage
  };
};
