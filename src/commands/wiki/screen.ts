import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloneDeep } from 'lodash-es';

import { useAxios } from '../../utils/useAxios.js';
import { useConfig } from '../../utils/useConfig.js';
import { useMarkdown } from '../../utils/useMarkdown.js';

import type { SlashCommand } from '../../types.js';
import type {
  TScreenGroupLink,
  TScreenItem,
  TScreenLink,
} from '../../types/Screen.js';

const http = useAxios();
const { API_URL } = useConfig();

const { getDescriptionEmbeds, getPagination } = useMarkdown();

const commandScreen: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('screen')
    .setDescription('Ширма (справочник)')
    .addStringOption((option) =>
      option
        .setName('name')
        .setNameLocalization('ru', 'название')
        .setDescription('Название записи в ширме')
        .setRequired(true)
        .setAutocomplete(true),
    ),
  autocomplete: async (interaction) => {
    try {
      const search = interaction.options.getString('name');

      if (!search) {
        await interaction.respond([]);

        return;
      }

      const resp = await http.post<TScreenGroupLink[] | TScreenLink[]>({
        url: `/screens`,
        payload: {
          page: 0,
          limit: 20,
          search: {
            value: search,
            exact: false,
          },
          order: [
            {
              field: 'ordering',
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

      const screens = search
        ? cloneDeep(resp.data).filter(
            (item: TScreenGroupLink | TScreenLink) => 'icon' in item,
          )
        : cloneDeep(resp.data);

      await interaction.respond(
        screens.map((screen: TScreenGroupLink | TScreenLink) => ({
          name: screen.name.rus,
          value: screen.url,
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
        await interaction.followUp('Название экрана обязательно');

        return;
      }

      const resp = await http.post<TScreenItem>({ url });

      if (resp.status !== 200) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз',
        );

        return;
      }

      const screen = cloneDeep(resp.data);

      const embed = new EmbedBuilder();

      const title = `${screen.name.rus} [${screen.name.eng}]`;
      const screenUrl = `${API_URL}${screen.url}`;

      const footer = `TTG Club | ${screen.source.name} ${
        screen.source.page || ''
      }`.trim();

      embed
        .setTitle(title)
        .setURL(screenUrl)
        .addFields({
          name: 'Источник',
          value: screen.source.shortName,
          inline: true,
        })
        .addFields({
          name: 'Категория',
          value: screen.parent.name.rus,
          inline: true,
        })
        .addFields({
          name: 'Оригинал',
          value: screenUrl,
          inline: false,
        })
        .setFooter({
          text: footer,
        });

      const description = getDescriptionEmbeds(screen.description);
      const descLength = description.length;

      const embeds = description.map((str, index) => {
        const embedItem = new EmbedBuilder().setDescription(str);

        if (!index || descLength > 2) {
          embedItem.setTitle('Описание');
        }

        return embedItem;
      });

      await interaction.followUp({ embeds: [embed] });

      if (embeds.length <= 2) {
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

export default commandScreen;
