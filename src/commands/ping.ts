import type { SlashCommand } from '../types';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { useHelpers } from '../utils/useHelpers';

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName('ping')
    .setDescription('Shows the bot\'s ping'),
  execute: async interaction => {
    const { getThemeColor } = useHelpers();

    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: 'MRC License' })
          .setDescription(`🏓 Pong! \n 📡 Ping: ${ interaction.client.ws.ping }`)
          .setColor(getThemeColor('text'))
      ]
    });
  },
  cooldown: 10
};

export default command;
