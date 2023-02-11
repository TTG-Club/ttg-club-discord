import { Guild } from 'discord.js';

import GuildModel from '../schemas/Guild';
import { BotEvent } from '../types';

const event: BotEvent = {
  name: 'guildCreate',
  execute: async (guild: Guild) => {
    let newGuild = new GuildModel({
      guildID: guild.id,
      options: {},
      joinedAt: Date.now()
    });

    await newGuild.save();
  }
};

export default event;
