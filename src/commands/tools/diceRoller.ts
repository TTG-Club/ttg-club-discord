import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { useDiceRoller } from '../../utils/useDiceRoller.js';

import type { SlashCommand } from '../../types.js';

const { getDiceMsg } = useDiceRoller();

const commandDiceRoller: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Бросок кубиков')
    .addStringOption(option =>
      option
        .setName('formula')
        .setNameLocalization('ru', 'формула')
        .setDescription('Формула броска')
        .setRequired(true)
    ),
  execute: async interaction => {
    try {
      // @ts-ignore
      const formula = interaction.options.getString('formula');

      const roll = getDiceMsg(formula);

      if (!roll) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз'
        );

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
          value: roll.highest.toString(),
          inline: false
        });
      }

      if (roll.lowest) {
        embed.addFields({
          name: 'Худший бросок',
          value: roll.lowest.toString(),
          inline: false
        });
      }

      if (formula !== '2d20' && formula !== '2к20') {
        embed.addFields({
          name: 'Результат',
          value: roll.result.toString(),
          inline: false
        });
      }

      await interaction.followUp({ embeds: [embed] });
    } catch (err) {
      console.error(err);

      await interaction.followUp(
        'Произошла какая-то ошибка... попробуй еще раз'
      );
    }
  },
  cooldown: 10
};

export default commandDiceRoller;
