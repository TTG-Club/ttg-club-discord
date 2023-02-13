import type { SlashCommand } from '../../types';
import type { TTraitItem, TTraitLink } from '../../types/Trait';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import _ from 'lodash';
import * as console from 'node:console';

import { useAxios } from '../../utils/useAxios';
import { useConfig } from '../../utils/useConfig';
import { useMarkdown } from '../../utils/useMarkdown';

const http = useAxios();
const { API_URL } = useConfig();
const { getDescriptionEmbeds, getPagination } = useMarkdown();

const commandTrait: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('trait')
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

      const traits: TTraitLink[] = _.cloneDeep(resp.data);

      await interaction.respond(traits.map((trait: TTraitLink) => ({
        name: trait.name.rus,
        value: trait.url
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

      const trait: TTraitItem = _.cloneDeep(resp.data);

      const title = `${ trait.name.rus } [${ trait.name.eng }]`;
      const traitUrl = `${ API_URL }${ url }`;
      const footer = `TTG Club | ${ trait.source.name } ${ trait.source.page || '' }`.trim();
      const description = getDescriptionEmbeds(trait.description);

      const fields = {
        requirements: {
          name: 'Требования',
          value: trait.requirements,
          inline: false
        },
        source: {
          name: 'Источник',
          value: trait.source.shortName,
          inline: true
        },
        url: {
          name: 'Оригинал',
          value: traitUrl,
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
        .setURL(traitUrl)
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

export default commandTrait;
