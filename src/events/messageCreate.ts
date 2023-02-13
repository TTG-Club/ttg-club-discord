import type { BotEvent } from '../types';
import type { Message } from 'discord.js';
import { ChannelType } from 'discord.js';

import { useConfig } from '../utils/useConfig';
import { useHelpers } from '../utils/useHelpers';

const { PREFIX } = useConfig();

const eventMessageCreate: BotEvent = {
  name: 'messageCreate',
  execute: (message: Message) => {
    const { sendTimedMessage, checkPermissions } = useHelpers();

    if (!message.member || message.member.user.bot) return;
    if (!message.guild) return;
    let prefix = PREFIX;

    if (!message.content.startsWith(prefix)) return;
    if (message.channel.type !== ChannelType.GuildText) return;

    let args = message.content.substring(prefix.length)
      .split(' ');

    // @ts-ignore
    let command = message.client.commands.get(args[0]);

    if (!command) {
      // @ts-ignore
      let commandFromAlias = message.client.commands.find(command => command.aliases.includes(args[0]));
      if (commandFromAlias) command = commandFromAlias;
      else return;
    }

    let cooldown = message.client.cooldowns.get(`${ command.name }-${ message.member.user.username }`);
    let neededPermissions = checkPermissions(message.member, command.permissions);

    if (neededPermissions !== null) {
      sendTimedMessage(
        `
            You don't have enough permissions to use this command. 
            \n Needed permissions: ${ neededPermissions.join(', ') }
            `,
        message.channel,
        5000
      );

      return;
    }

    if (command.cooldown && cooldown) {
      if (Date.now() < cooldown) {
        sendTimedMessage(
          `You have to wait ${
            Math.floor(Math.abs(Date.now() - cooldown) / 1000)
          } second(s) to use this command again.`,
          message.channel,
          5000
        );

        return;
      }

      message.client.cooldowns.set(
        `${ command.name }-${ message.member.user.username }`,
        Date.now() + command.cooldown * 1000
      );

      setTimeout(() => {
        message.client.cooldowns.delete(`${ command?.name }-${ message.member?.user.username }`);
      }, command.cooldown * 1000);
    } else if (command.cooldown && !cooldown) {
      message.client.cooldowns.set(
        `${ command.name }-${ message.member.user.username }`,
        Date.now() + command.cooldown * 1000
      );
    }

    command.execute(message, args);
  }
};

export default eventMessageCreate;
