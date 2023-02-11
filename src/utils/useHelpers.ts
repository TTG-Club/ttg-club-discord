import chalk from 'chalk';
import type {
  GuildMember, PermissionResolvable, TextChannel
} from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';

export type colorType = 'text' | 'variable' | 'error';

export const useHelpers = () => {
  const themeColors: { [key in colorType]: string } = {
    text: '#ff8e4d',
    variable: '#ff624d',
    error: '#f5426c'
  };

  const getThemeColor = (color: colorType) => Number(`0x${ themeColors[color].substring(1) }`);

  const color = (color: colorType, message: any) => {
    return chalk.hex(themeColors[color])(message);
  };

  const checkPermissions = (member: GuildMember, permissions: Array<PermissionResolvable>) => {
    let neededPermissions: PermissionResolvable[] = [];

    permissions.forEach(permission => {
      if (!member.permissions.has(permission)) neededPermissions.push(permission);
    });
    if (neededPermissions.length === 0) return null;

    return neededPermissions.map(p => {
      if (typeof p === 'string') return p.split(/(?=[A-Z])/)
        .join(' ');
      else
        return Object.keys(PermissionFlagsBits)
          .find(k => Object(PermissionFlagsBits)[k] === p)
          ?.split(/(?=[A-Z])/)
          .join(' ');
    });
  };

  const sendTimedMessage = (message: string, channel: TextChannel, duration: number) => {
    channel.send(message)
      .then(m => setTimeout(async () => await (await channel.messages.fetch(m)).delete(), duration));

    return;
  };

  return {
    themeColors,

    getThemeColor,
    color,
    checkPermissions,
    sendTimedMessage
  };
};
