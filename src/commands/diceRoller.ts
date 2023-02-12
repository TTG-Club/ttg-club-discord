import type { SlashCommand } from '../types';
import type { TRollResult } from '../utils/useDiceRoller';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as console from 'node:console';

import { useDiceRoller } from '../utils/useDiceRoller';

const { getDiceMsg } = useDiceRoller();

const commandDiceRoller: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Бросок кубиков')
    .addStringOption(option => option
      .setName('formula')
      .setNameLocalization('ru', 'формула')
      .setDescription('Формула броска')
      .setRequired(true)),
  execute: async interaction => {
    try {
      // @ts-ignore
      const formula = interaction.options.getString('formula');

      const roll: TRollResult | null = await getDiceMsg(formula);

      if (!roll) {
        await interaction.reply('Произошла какая-то ошибка... попробуй еще раз');

        return;
      }

      const embed = new EmbedBuilder();

      embed.addFields({
        name: 'Развернутый результат',
        value: roll.full,
        inline: false
      });

      if (roll.highest) {
        embed.addFields({
          name: 'Лучший бросок',
          value: roll.highest,
          inline: false
        });
      }

      if (roll.lowest) {
        embed.addFields({
          name: 'Худший бросок',
          value: roll.lowest,
          inline: false
        });
      }

      if (formula !== '2d20') {
        embed.addFields({
          name: 'Результат',
          value: roll.result,
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed]});
    } catch (err) {
      console.error(err);
      await interaction.reply('Произошла какая-то ошибка... попробуй еще раз');
    }
  },
  cooldown: 10
};

export default commandDiceRoller;
