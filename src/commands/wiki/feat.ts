import type { SlashCommand } from '../../types';
import type { TFeatItem, TFeatLink } from '../../types/Feat';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import _ from 'lodash';
import * as console from 'node:console';

import { useAxios } from '../../utils/useAxios';
import { useConfig } from '../../utils/useConfig';
import { useMarkdown } from '../../utils/useMarkdown';

const http = useAxios();
const { API_URL } = useConfig();
const { getDescriptionEmbeds, getPagination } = useMarkdown();

const commandFeat: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('feat')
    .setDescription('Черты')
    .addStringOption(option => option
      .setName('name')
      .setNameLocalization('ru', 'название')
      .setDescription('Название черты')
      .setRequired(true)
      .setAutocomplete(true)),
  autocomplete: async interaction => {
    try {
      const resp = await http.post({
        url: `/traits`,
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

      const feats: TFeatLink[] = _.cloneDeep(resp.data);

      await interaction.respond(feats.map((feat: TFeatLink) => ({
        name: feat.name.rus,
        value: feat.url
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

      const feat: TFeatItem = _.cloneDeep(resp.data);

      const title = `${ feat.name.rus } [${ feat.name.eng }]`;
      const featUrl = `${ API_URL }${ url }`;
      const footer = `TTG Club | ${ feat.source.name } ${ feat.source.page || '' }`.trim();
      const description = getDescriptionEmbeds(feat.description);

      const fields = {
        requirements: {
          name: 'Требования',
          value: feat.requirements,
          inline: false
        },
        source: {
          name: 'Источник',
          value: feat.source.shortName,
          inline: true
        },
        url: {
          name: 'Оригинал',
          value: featUrl,
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
        .setURL(featUrl)
        .addFields(fields.source)
        .addFields(fields.requirements)
        .addFields(fields.url)
        .setFooter({ text: footer });

      const descLength = description.length;

      embeds.desc = description.map((str, index) => {
        const embed = new EmbedBuilder()
          .setDescription(str);

        if (!index || descLength > 2) {
          embed.setTitle('Описание');
        }

        return embed;
      });

      await interaction.followUp({
        embeds: [embeds.main]
      });

      if (embeds.desc.length <= 2) {
        await interaction.followUp({ embeds: embeds.desc });

        return;
      }

      const pagination = await getPagination(interaction, embeds.desc);

      await pagination.paginate();
    } catch (err) {
      console.error(err);
      await interaction.followUp('Произошла какая-то ошибка... попробуй еще раз');
    }
  },
  cooldown: 10
};

export default commandFeat;
