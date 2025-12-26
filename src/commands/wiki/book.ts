import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloneDeep } from 'lodash-es';

import { useAxios } from '../../utils/useAxios.js';
import { useConfig } from '../../utils/useConfig.js';
import { useMarkdown } from '../../utils/useMarkdown.js';

import type { SlashCommand } from '../../types.js';
import type { TBookItem, TBookLink } from '../../types/Book.js';

const http = useAxios();
const { API_URL } = useConfig();

const { getDescriptionEmbeds, getPagination } = useMarkdown();

const commandBook: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('book')
    .setDescription('Источники')
    .addStringOption((option) =>
      option
        .setName('name')
        .setNameLocalization('ru', 'название')
        .setDescription('Название источника')
        .setRequired(true)
        .setAutocomplete(true),
    ),
  autocomplete: async (interaction) => {
    try {
      const resp = await http.post<TBookLink[]>({
        url: `/books`,
        payload: {
          page: 0,
          limit: 10,
          search: {
            value: interaction.options.getString('name'),
            exact: false,
          },
          order: [
            {
              field: 'year',
              direction: 'asc',
            },
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

      const books = cloneDeep(resp.data);

      await interaction.respond(
        books.map((book: TBookLink) => ({
          name: book.name.rus,
          value: book.url,
        })),
      );
    } catch (err) {
      console.error(err);
      await interaction.respond([]);
    }
  },
  execute: async (interaction) => {
    try {
      const url = interaction.options.getString('name') as string;

      const resp = await http.post<TBookItem>({ url });

      if (resp.status !== 200) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз',
        );

        return;
      }

      const book = cloneDeep(resp.data);

      const title = `${book.name.rus} [${book.name.eng}]`;
      const bookUrl = `${API_URL}${url}`;

      const footer = `TTG Club | ${book.source.name} ${
        book.source.page || ''
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
        .setURL(bookUrl)
        .addFields({
          name: 'Тип',
          value: book.type.name,
          inline: true,
        })
        .addFields({
          name: 'Аббревиатура',
          value: book.source.shortName,
          inline: true,
        })
        .setFooter({ text: footer });

      if (book.year) {
        embeds.main.addFields({
          name: 'Год',
          value: String(book.year),
          inline: true,
        });
      }

      embeds.main.addFields({
        name: 'Оригинал',
        value: bookUrl,
        inline: false,
      });

      await interaction.followUp({
        embeds: [embeds.main],
      });

      if (book.description) {
        const description = getDescriptionEmbeds(book.description);

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
      }
    } catch (err) {
      console.error(err);

      await interaction.followUp(
        'Произошла какая-то ошибка... попробуй еще раз',
      );
    }
  },
  cooldown: 10,
};

export default commandBook;
