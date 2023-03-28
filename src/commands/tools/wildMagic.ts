import type { SlashCommand } from '../../types';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import _ from 'lodash';
import * as console from 'node:console';

import { useAxios } from '../../utils/useAxios';
import { useMarkdown } from '../../utils/useMarkdown';

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
    .addIntegerOption(option => option
      .setName('count')
      .setNameLocalization('ru', 'количество')
      .setDescription('Количество сгенерированной дикой магии')
      .setMinValue(1)
      .setMaxValue(15))
    .addStringOption(option => option
      .setName('source')
      .setNameLocalization('ru', 'источник')
      .setDescription('Источник таблиц для генерации')
      .setAutocomplete(true)),
  autocomplete: async interaction => {
    try {
      const resp = await http.get({ url: `/tools/wildmagic` });

      if (resp.status !== 200) {
        await interaction.respond([]);

        return;
      }

      const sources = _.cloneDeep(resp.data).map((item: ISource) => ({
        name: `[${ item.shortName }]${ item.homebrew ? ' [HB]' : '' } ${ item.name }`,
        value: item.shortName
      }));

      await interaction.respond(sources);
    } catch (err) {
      console.error(err);

      await interaction.respond([]);
    }
  },
  execute: async interaction => {
    try {
      // @ts-ignore
      const source = interaction.options.getString('source') as string || null;

      // @ts-ignore
      const count = interaction.options.getInteger('count') as number || 1;

      const payload: {
        count: number,
        sources: Array<ISource['shortName']>
      } = {
        count,
        sources: ['PHB']
      };

      if (source) {
        payload.sources = [source];
      }

      const resp = await http.post({
        url: `/tools/wildmagic`,
        payload
      });

      if (resp.status !== 200) {
        await interaction.followUp('Произошла какая-то ошибка... попробуй еще раз');

        return;
      }

      const results: Array<{
        description: string;
        source: ISource
      }> = _.cloneDeep(resp.data);

      const embeds = results
        .map(result => (
          new EmbedBuilder()
            .setColor('#5865F2')
            .setDescription(result.description ? getMarkdown(result.description) : '')
            .setFooter({ text: `TTG Club | ${ result.source.name }` })
        ));

      if (embeds.length < 2) {
        await interaction.followUp({ embeds });

        return;
      }

      const pagination = await getPagination(interaction, embeds);

      await pagination.paginate();
    } catch (err) {
      console.error(err);
      await interaction.followUp('Произошла какая-то ошибка... попробуй еще раз');
    }
  },
  cooldown: 10
};

export default commandWildMagic;
