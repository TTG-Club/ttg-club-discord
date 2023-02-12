import type { SlashCommand } from '../types';
import type {
  TScreenGroupLink, TScreenItem, TScreenLink
} from '../types/Screen';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import _ from 'lodash';
import * as console from 'node:console';
import sanitizeHtml from 'sanitize-html';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

import { useAxios } from '../utils/useAxios';
import { useConfig } from '../utils/useConfig';

const http = useAxios();
const { API_URL } = useConfig();

const commandScreen: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('screen')
    .setDescription('Beta: Получение информации из ширмы')
    .addStringOption(option => option
      .setName('name')
      .setNameLocalization('ru', 'название')
      .setDescription('Название записи в ширме')
      .setRequired(true)
      .setAutocomplete(true)),
  autocomplete: async interaction => {
    try {
      const search = interaction.options.getString('name') || '';

      if (!search) {
        await interaction.respond([]);

        return;
      }

      const resp = await http.post({
        url: `/screens`,
        payload: {
          page: 0,
          limit: 20,
          search: {
            value: search,
            exact: false
          },
          order: [
            {
              field: 'ordering',
              direction: 'asc'
            },
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

      const screens: TScreenGroupLink[] | TScreenLink[] = search
        ? _.cloneDeep(resp.data).filter((item: TScreenGroupLink | TScreenLink) => 'icon' in item)
        : _.cloneDeep(resp.data);

      await interaction.respond(screens.map((screen: TScreenGroupLink | TScreenLink) => ({
        name: screen.name.rus,
        value: screen.url
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
        await interaction.reply('Произошла какая-то ошибка... попробуй еще раз');

        return;
      }

      const screen: TScreenItem = _.cloneDeep(resp.data);

      const embed = new EmbedBuilder();

      const turndownService = new TurndownService();

      turndownService.use(gfm);

      turndownService.addRule('strikethrough', {
        filter: 'p',
        replacement: content => `\n\n${ content }\n\n`
      });

      const title = `${ screen.name.rus } [${ screen.name.eng }]`;
      const thumbnail = `${ API_URL }/style/icons/192.png`;
      const screenUrl = `${ API_URL }${ screen.url }`;

      const description = screen.description
        ? turndownService.turndown(sanitizeHtml(screen.description, {
          transformTags: {
            'dice-roller': 'b'
          }
        }))
        : '';

      const footer = `TTG Club | ${ screen.source.name } ${ screen.source.page || '' }`.trim();

      embed
        .setTitle(title)
        .setURL(screenUrl)
        .setThumbnail(thumbnail)
        .setDescription(description)
        .addFields({
          name: 'Источник',
          value: screen.source.shortName,
          inline: true
        })
        .addFields({
          name: 'Категория',
          value: screen.parent.name.rus,
          inline: true
        })
        .addFields({
          name: 'Оригинал',
          value: screenUrl,
          inline: false
        })
        .setFooter({
          text: footer
        });

      await interaction.reply({ embeds: [embed]});
    } catch (err) {
      console.error(err);
      await interaction.reply('Произошла какая-то ошибка... попробуй еще раз');
    }
  },
  cooldown: 10
};

export default commandScreen;