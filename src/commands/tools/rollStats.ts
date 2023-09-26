import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { useDiceRoller } from '../../utils/useDiceRoller.js';

import type { SlashCommand } from '../../types.js';

const { getDiceMsg } = useDiceRoller();

const commandRollStats: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('roll-stats')
    .setDescription('Набросать характеристики'),
  execute: async interaction => {
    try {
      const embed = new EmbedBuilder();

      const rolls = await Promise.all(
        Array.from(Array(6), () => getDiceMsg('4d6kh3'))
      );

      const total = rolls.reduce((result, roll) => result + roll.value, 0);

      const results = rolls.map(
        (roll, index) => `${index + 1}. [${roll.notation}]: ${roll.rendered}`
      );

      embed
        .setColor('#3567C9')
        .addFields({
          name: 'Броски характеристик',
          value: results.join('\n'),
          inline: false
        })
        .addFields({
          name: 'Суммарное значение',
          value: total.toString(),
          inline: false
        });

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

export default commandRollStats;
