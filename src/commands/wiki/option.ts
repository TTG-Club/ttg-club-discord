import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloneDeep } from 'lodash-es';

import { useAxios } from '../../utils/useAxios.js';
import { useConfig } from '../../utils/useConfig.js';
import { useMarkdown } from '../../utils/useMarkdown.js';

import type { TOptionItem, TOptionLink } from '../../types/Option.js';
import type { SlashCommand } from '../../types.js';

const http = useAxios();
const { API_URL } = useConfig();

const { getDescriptionEmbeds, getPagination } = useMarkdown();

const commandOption: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('option')
    .setDescription('Особенности классов')
    .addStringOption(option =>
      option
        .setName('name')
        .setNameLocalization('ru', 'название')
        .setDescription('Название особенности класса')
        .setRequired(true)
        .setAutocomplete(true)
    ),
  autocomplete: async interaction => {
    try {
      const resp = await http.post<TOptionLink[]>({
        url: `/options`,
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

      const options = cloneDeep(resp.data);

      await interaction.respond(
        options.map((option: TOptionLink) => ({
          name: option.name.rus,
          value: option.url
        }))
      );
    } catch (err) {
      console.error(err);
      await interaction.respond([]);
    }
  },
  execute: async interaction => {
    try {
      // @ts-ignore
      const url = interaction.options.getString('name');

      const resp = await http.post<TOptionItem>({ url });

      if (resp.status !== 200) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз'
        );

        return;
      }

      const option = cloneDeep(resp.data);

      const title = `${option.name.rus} [${option.name.eng}]`;
      const optionUrl = `${API_URL}${url}`;

      const footer = `TTG Club | ${option.source.name} ${
        option.source.page || ''
      }`.trim();

      const description = getDescriptionEmbeds(option.description);

      const fields = {
        requirements: {
          name: 'Требования',
          value: option.requirements,
          inline: false
        },
        source: {
          name: 'Источник',
          value: option.source.shortName,
          inline: true
        },
        url: {
          name: 'Оригинал',
          value: optionUrl,
          inline: false
        },
        classes: {
          name: 'Классы',
          value: option.classes?.length
            ? option.classes.map((classItem: any) => classItem.name).join(', ')
            : '',
          inline: false
        }
      };

      const embeds: {
        main: EmbedBuilder;
        desc: EmbedBuilder[];
      } = {
        main: new EmbedBuilder(),
        desc: []
      };

      embeds.main
        .setTitle(title)
        .setURL(optionUrl)
        .addFields(fields.source)
        .addFields(fields.requirements)
        .addFields(fields.classes)
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

      await interaction.followUp(
        'Произошла какая-то ошибка... попробуй еще раз'
      );
    }
  },
  cooldown: 10
};

export default commandOption;
