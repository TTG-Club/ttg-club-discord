import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloneDeep } from 'lodash-es';

import { useAxios } from '../../utils/useAxios.js';
import { useMarkdown } from '../../utils/useMarkdown.js';

import type { SlashCommand } from '../../types.js';

const http = useAxios();

const { getPagination, getMarkdown } = useMarkdown();

interface ISource {
  shortName: string;
  name: string;
  homebrew?: true;
  page?: number;
}

const commandWildMagic: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('wild-magic')
    .setDescription('Генератор дикой магии')
    .addIntegerOption((option) =>
      option
        .setName('count')
        .setNameLocalization('ru', 'количество')
        .setDescription('Количество сгенерированной дикой магии')
        .setMinValue(1)
        .setMaxValue(15),
    )
    .addStringOption((option) =>
      option
        .setName('source')
        .setNameLocalization('ru', 'источник')
        .setDescription('Источник таблиц для генерации')
        .setAutocomplete(true),
    ),
  autocomplete: async (interaction) => {
    try {
      const resp = await http.get<Array<ISource>>({ url: `/tools/wildmagic` });

      if (resp.status !== 200) {
        await interaction.respond([]);

        return;
      }

      const sources = cloneDeep(resp.data).map((item) => ({
        name: `[${item.shortName}]${item.homebrew ? ' [HB]' : ''} ${item.name}`,
        value: item.shortName,
      }));

      await interaction.respond(sources);
    } catch (err) {
      console.error(err);

      await interaction.respond([]);
    }
  },
  execute: async (interaction) => {
    try {
      const source =
        (interaction.options.getString('source') as string) || null;

      const count = (interaction.options.getInteger('count') as number) || 1;

      const payload: {
        count: number;
        sources: Array<ISource['shortName']>;
      } = {
        count,
        sources: ['PHB'],
      };

      if (source) {
        payload.sources = [source];
      }

      const resp = await http.post<
        Array<{
          description: string;
          source: ISource;
        }>
      >({
        url: `/tools/wildmagic`,
        payload,
      });

      if (resp.status !== 200) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз',
        );

        return;
      }

      const results = cloneDeep(resp.data);

      const embeds = results.map((result) =>
        new EmbedBuilder()
          .setColor('#5865F2')
          .setDescription(
            result.description ? getMarkdown(result.description) : '',
          )
          .setFooter({ text: `TTG Club | ${result.source.name}` }),
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
        'Произошла какая-то ошибка... попробуй еще раз',
      );
    }
  },
  cooldown: 10,
};

export default commandWildMagic;
