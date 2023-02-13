import type { SlashCommand } from '../types';
import type { TItemItem, TItemLink } from '../types/Item';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import _ from 'lodash';
import * as console from 'node:console';

import { useAxios } from '../utils/useAxios';
import { useConfig } from '../utils/useConfig';
import { useMarkdown } from '../utils/useMarkdown';

const http = useAxios();
const { API_URL } = useConfig();
const { getDescriptionEmbeds, getPagination } = useMarkdown();

const commandItem: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('item')
    .setDescription('Снаряжение')
    .addStringOption(option => option
      .setName('name')
      .setNameLocalization('ru', 'название')
      .setDescription('Название предмета')
      .setRequired(true)
      .setAutocomplete(true)),
  autocomplete: async interaction => {
    try {
      const resp = await http.post({
        url: `/items`,
        payload: {
          page: 0,
          limit: 10,
          search: {
            value: interaction.options.getString('name'),
            exact: false
          },
          order: [
            {
              field: 'name',
              direction: 'asc'
            }
          ]
        }
      });

      if (resp.status !== 200) {
        await interaction.respond([]);

        return;
      }

      const items: TItemLink[] = _.cloneDeep(resp.data);

      await interaction.respond(items.map((item: TItemLink) => ({
        name: item.name.rus,
        value: item.url
      })));
    } catch (err) {
      console.error(err);
      await interaction.respond([]);
    }
  },
  execute: async interaction => {
    try {
      // @ts-ignore
      const url = interaction.options.getString('name');

      const resp = await http.post({ url });

      if (resp.status !== 200) {
        await interaction.followUp('Произошла какая-то ошибка... попробуй еще раз');

        return;
      }

      const item: TItemItem = _.cloneDeep(resp.data);

      const title = `${ item.name.rus } [${ item.name.eng }]`;
      const itemUrl = `${ API_URL }${ url }`;
      const footer = `TTG Club | ${ item.source.name } ${ item.source.page || '' }`.trim();

      const fields = {
        price: {
          name: 'Цена',
          value: String(item.price),
          inline: true
        },
        weight: {
          name: 'Вес (в фунтах)',
          value: String(item.weight),
          inline: true
        },
        source: {
          name: 'Источник',
          value: item.source.shortName,
          inline: true
        },
        url: {
          name: 'Оригинал',
          value: itemUrl,
          inline: false
        },
        categories: {
          name: 'Категории',
          value: item.categories.join(', '),
          inline: false
        }
      };

      const embeds: {
        main: EmbedBuilder,
        desc: EmbedBuilder[]
      } = {
        main: new EmbedBuilder(),
        desc: []
      };

      embeds.main
        .setTitle(title)
        .setURL(itemUrl);

      if (item.price) {
        embeds.main
          .addFields(fields.price);
      }

      if (item.weight) {
        embeds.main
          .addFields(fields.weight);
      }

      embeds.main
        .addFields(fields.source)
        .addFields(fields.categories)
        .addFields(fields.url)
        .setFooter({ text: footer });

      await interaction.followUp({
        embeds: [embeds.main]
      });

      if (item.description) {
        const description = getDescriptionEmbeds(item.description);

        embeds.desc = description.map(str => (
          new EmbedBuilder()
            .setTitle('Описание')
            .setDescription(str)
        ));

        if (embeds.desc.length <= 2) {
          await interaction.followUp({ embeds: embeds.desc });

          return;
        }

        const pagination = await getPagination(interaction, embeds.desc);

        await pagination.paginate();
      }
    } catch (err) {
      console.error(err);
      await interaction.followUp('Произошла какая-то ошибка... попробуй еще раз');
    }
  },
  cooldown: 10
};

export default commandItem;
