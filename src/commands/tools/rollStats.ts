import type { SlashCommand } from '../../types';
import type { TRollResult } from '../../utils/useDiceRoller';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { isNumber } from 'lodash';
import * as console from 'node:console';

import { useDiceRoller } from '../../utils/useDiceRoller';

const { getDiceMsg } = useDiceRoller();

const commandRollStats: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('roll-stats')
    .setDescription('Набросать характеристики'),
  execute: async interaction => {
    try {
      const embed = new EmbedBuilder();
      const rolls: TRollResult[] = [];

      let total = 0;

      for (let i = 0; i < 6; i++) {
        const roll: TRollResult | null = await getDiceMsg('4d6kh3');
        const result = Number(roll?.result);

        if (!roll || !isNumber(result)) {
          await interaction.followUp('Произошла какая-то ошибка... попробуй еще раз');

          return;
        }

        rolls.push(roll);
        total += result;
      }

      let str = '';

      for (let i = 0; i < rolls.length; i++) {
        const roll = rolls[i];

        if (!roll) {
          await interaction.followUp('Произошла какая-то ошибка... попробуй еще раз');

          return;
        }

        const match = roll.full.match(/(?<formula>.+?):\s\[(?<rolls>.+?)]/);

        const result = match?.groups as {
          formula: string;
          rolls: string;
        } | undefined;

        if (!result) {
          await interaction.followUp('Произошла какая-то ошибка... попробуй еще раз');

          return;
        }

        const rollsParsed = result.rolls
          .split(', ')
          .map(roll => (
            roll.endsWith('d')
              ? `~~${ roll.replace('d', '') }~~`
              : `**${ roll }**`))
          .join(', ');

        str += `**${ i + 1 }.** ${ result.formula }: [${ rollsParsed }] = \`${ roll.result }\`\n`;
      }

      embed
        .addFields({
          name: 'Броски характеристик',
          value: str,
          inline: false
        })
        .addFields({
          name: 'Суммарное значение',
          value: total.toString(),
          inline: false
        });

      await interaction.followUp({ embeds: [embed]});
    } catch (err) {
      console.error(err);

      await interaction.followUp('Произошла какая-то ошибка... попробуй еще раз');
    }
  },
  cooldown: 10
};

export default commandRollStats;
