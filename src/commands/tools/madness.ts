import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloneDeep } from 'lodash-es';

import { useAxios } from '../../utils/useAxios.js';
import { useMarkdown } from '../../utils/useMarkdown.js';

import type { SlashCommand } from '../../types.js';

const http = useAxios();

const { getPagination, getMarkdown } = useMarkdown();

interface IDuration {
  name: string;
  value: string;
  additional?: string;
}

const commandMadness: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('madness')
    .setDescription('Генератор безумия')
    .addIntegerOption(option =>
      option
        .setName('count')
        .setNameLocalization('ru', 'количество')
        .setDescription('Количество сгенерированных безумий')
        .setMinValue(1)
        .setMaxValue(15)
    )
    .addStringOption(option =>
      option
        .setName('duration')
        .setNameLocalization('ru', 'длительность')
        .setDescription('Длительность безумия')
        .setAutocomplete(true)
    ),
  autocomplete: async interaction => {
    try {
      const resp = await http.get({ url: `/tools/madness` });

      if (resp.status !== 200) {
        await interaction.respond([]);

        return;
      }

      const durations = cloneDeep(resp.data) as Array<IDuration>;

      await interaction.respond(durations);
    } catch (err) {
      console.error(err);

      await interaction.respond([]);
    }
  },
  execute: async interaction => {
    try {
      const duration =
        // @ts-ignore
        (interaction.options.getString('duration') as IDuration['value']) ||
        null;

      // @ts-ignore
      const count = interaction.options.getInteger('count') || 1;

      const payload: {
        count: number;
        type?: IDuration['value'];
      } = { count };

      if (duration) {
        payload.type = duration;
      }

      const resp = await http.post<
        Array<{
          description: string;
          type: IDuration;
        }>
      >({
        url: `/tools/madness`,
        payload
      });

      if (resp.status !== 200) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз'
        );

        return;
      }

      const results = cloneDeep(resp.data);

      const embeds = results.map(result =>
        new EmbedBuilder()
          .setColor('#D84613')
          .addFields({
            name: 'Тип',
            value: result.type.name,
            inline: true
          })
          .addFields({
            name: 'Длительность',
            value: result.type.additional || '',
            inline: true
          })
          .addFields({
            name: 'Описание',
            value: result.description ? getMarkdown(result.description) : '',
            inline: false
          })
          .setFooter({ text: 'TTG Club' })
      );

      if (embeds.length < 2) {
        await interaction.followUp({ embeds });

        return;
      }

      const pagination = await getPagination(interaction, embeds);

      await pagination.paginate();
    } catch (err) {
      console.error(err);

      await interaction.followUp(
        'Произошла какая-то ошибка... попробуй еще раз'
      );
    }
  },
  cooldown: 10
};

export default commandMadness;
