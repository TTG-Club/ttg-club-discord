import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloneDeep } from 'lodash-es';

import { useAxios } from '../../utils/useAxios.js';
import { useConfig } from '../../utils/useConfig.js';
import { useMarkdown } from '../../utils/useMarkdown.js';

import type { SlashCommand } from '../../types.js';
import type { TFeatItem, TFeatLink } from '../../types/Feat.js';

const http = useAxios();
const { SITE_URL } = useConfig();

const { getDescriptionEmbeds, getPagination } = useMarkdown();

const commandFeat: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('feat')
    .setDescription('Черты')
    .addStringOption((option) =>
      option
        .setName('name')
        .setNameLocalization('ru', 'название')
        .setDescription('Название черты')
        .setRequired(true)
        .setAutocomplete(true),
    ),
  autocomplete: async (interaction) => {
    try {
      const resp = await http.post<TFeatLink[]>({
        url: `/traits`,
        payload: {
          page: 0,
          size: 25,
          search: {
            value: interaction.options.getString('name') || '',
            exact: false,
          },
          order: [{ field: 'name', direction: 'asc' }],
        },
      });

      if (resp.status !== 200) {
        await interaction.respond([]);

        return;
      }

      await interaction.respond(
        resp.data.map((feat: TFeatLink) => ({
          name: feat.name.rus,
          value: feat.url,
        })),
      );
    } catch (err) {
      console.error(err);
      await interaction.respond([]);
    }
  },
  execute: async (interaction) => {
    try {
      const url = interaction.options.getString('name');

      if (!url) {
        await interaction.followUp('Название черты обязательно');

        return;
      }

      const resp = await http.post<TFeatItem>({ url });

      if (resp.status !== 200) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз',
        );

        return;
      }

      const feat = cloneDeep(resp.data);

      const title = `${feat.name.rus} [${feat.name.eng}]`;
      const featUrl = `${SITE_URL}${url}`;

      const footer = `TTG Club | ${feat.source.name} ${
        feat.source.page || ''
      }`.trim();

      const description = getDescriptionEmbeds(feat.description);

      const fields = {
        requirements: {
          name: 'Требования',
          value: feat.requirements,
          inline: false,
        },
        source: {
          name: 'Источник',
          value: feat.source.shortName,
          inline: true,
        },
        url: {
          name: 'Оригинал',
          value: featUrl,
          inline: false,
        },
      };

      const embeds: {
        main: EmbedBuilder;
        desc: EmbedBuilder[];
      } = {
        main: new EmbedBuilder(),
        desc: [],
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
        const embed = new EmbedBuilder().setDescription(str);

        if (!index || descLength > 2) {
          embed.setTitle('Описание');
        }

        return embed;
      });

      await interaction.followUp({
        embeds: [embeds.main],
      });

      if (embeds.desc.length <= 2) {
        await interaction.followUp({ embeds: embeds.desc });

        return;
      }

      const pagination = getPagination(interaction, embeds.desc);

      await pagination.render();
    } catch (err) {
      console.error(err);

      await interaction.followUp(
        'Произошла какая-то ошибка... попробуй еще раз',
      );
    }
  },
  cooldown: 10,
};

export default commandFeat;
