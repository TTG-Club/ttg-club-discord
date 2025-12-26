import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloneDeep } from 'lodash-es';

import { useAxios } from '../../utils/useAxios.js';
import { useConfig } from '../../utils/useConfig.js';
import { useMarkdown } from '../../utils/useMarkdown.js';

import type { SlashCommand } from '../../types.js';
import type { TGodItem, TGodLink } from '../../types/God.js';

const http = useAxios();
const { API_URL } = useConfig();

const { getDescriptionEmbeds, getPagination } = useMarkdown();

const commandGod: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('god')
    .setDescription('Боги')
    .addStringOption((option) =>
      option
        .setName('name')
        .setNameLocalization('ru', 'имя')
        .setDescription('Имя бога')
        .setRequired(true)
        .setAutocomplete(true),
    ),
  autocomplete: async (interaction) => {
    try {
      const resp = await http.post<TGodLink[]>({
        url: `/gods`,
        payload: {
          page: 0,
          limit: 10,
          search: {
            value: interaction.options.getString('name'),
            exact: false,
          },
          order: [
            {
              field: 'name',
              direction: 'asc',
            },
          ],
        },
      });

      if (resp.status !== 200) {
        await interaction.respond([]);

        return;
      }

      const gods = cloneDeep(resp.data);

      await interaction.respond(
        gods.map((god: TGodLink) => ({
          name: `[${god.shortAlignment}] ${god.name.rus}`,
          value: god.url,
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
        await interaction.followUp('Название божества обязательно');

        return;
      }

      const resp = await http.post<TGodItem>({ url });

      if (resp.status !== 200) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз',
        );

        return;
      }

      const god = cloneDeep(resp.data);

      const title = `${god.name.rus} [${god.name.eng}]`;
      const godUrl = `${API_URL}${url}`;
      const thumbnail = god.images?.length ? god.images[0] : null;

      const footer = `TTG Club | ${god.source.name} ${
        god.source.page || ''
      }`.trim();

      const embeds: {
        main: EmbedBuilder;
        desc: EmbedBuilder[];
      } = {
        main: new EmbedBuilder(),
        desc: [],
      };

      embeds.main
        .setTitle(title)
        .setURL(godUrl)
        .addFields({
          name: 'Источник',
          value: god.source.shortName,
          inline: false,
        })
        .addFields({
          name: 'Мировоззрение',
          value: god.alignment,
          inline: false,
        })
        .addFields({
          name: 'Ранг',
          value: god.rank,
          inline: false,
        })
        .addFields({
          name: 'Домены',
          value: god.domains.join(', '),
          inline: false,
        })
        .addFields({
          name: 'Пантеоны',
          value: god.panteons.join(', '),
          inline: false,
        })
        .setFooter({ text: footer });

      if (god.titles?.length) {
        embeds.main.addFields({
          name: 'Титулы',
          value: god.titles.join(', '),
          inline: false,
        });
      }

      if (god.symbol) {
        embeds.main.addFields({
          name: 'Символы',
          value: god.symbol,
          inline: false,
        });
      }

      embeds.main.addFields({
        name: 'Оригинал',
        value: godUrl,
        inline: false,
      });

      if (thumbnail) {
        embeds.main.setThumbnail(thumbnail);
      }

      await interaction.followUp({
        embeds: [embeds.main],
      });

      const description = getDescriptionEmbeds(god.description);

      const descLength = description.length;

      embeds.desc = description.map((str, index) => {
        const embed = new EmbedBuilder().setDescription(str);

        if (!index || descLength > 2) {
          embed.setTitle('Описание');
        }

        return embed;
      });

      if (embeds.desc.length <= 2) {
        await interaction.followUp({ embeds: embeds.desc });

        return;
      }

      const pagination = await getPagination(interaction, embeds.desc);

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

export default commandGod;
