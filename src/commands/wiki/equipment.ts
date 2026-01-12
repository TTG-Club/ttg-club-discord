import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloneDeep } from 'lodash-es';

import { useAxios } from '../../utils/useAxios.js';
import { useConfig } from '../../utils/useConfig.js';
import { useMarkdown } from '../../utils/useMarkdown.js';

import type { SlashCommand } from '../../types.js';
import type { TEquipmentItem, TEquipmentLink } from '../../types/Equipment.js';

const http = useAxios();
const { SITE_URL } = useConfig();

const { getDescriptionEmbeds, getPagination } = useMarkdown();

const commandEquipment: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('equipment')
    .setDescription('Снаряжение')
    .addStringOption((option) =>
      option
        .setName('name')
        .setNameLocalization('ru', 'название')
        .setDescription('Название предмета')
        .setRequired(true)
        .setAutocomplete(true),
    ),
  autocomplete: async (interaction) => {
    try {
      const resp = await http.post<TEquipmentLink[]>({
        url: `/items`,
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
        resp.data.map((item: TEquipmentLink) => ({
          name: item.name.rus,
          value: item.url,
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
        await interaction.followUp('Название снаряжения обязательно');

        return;
      }

      const resp = await http.post<TEquipmentItem>({ url });

      if (resp.status !== 200) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз',
        );

        return;
      }

      const equipment = cloneDeep(resp.data);

      const title = `${equipment.name.rus} [${equipment.name.eng}]`;
      const itemUrl = `${SITE_URL}${url}`;

      const footer = `TTG Club | ${equipment.source.name} ${
        equipment.source.page || ''
      }`.trim();

      const fields = {
        price: {
          name: 'Цена',
          value: String(equipment.price),
          inline: true,
        },
        weight: {
          name: 'Вес (в фунтах)',
          value: String(equipment.weight),
          inline: true,
        },
        source: {
          name: 'Источник',
          value: equipment.source.shortName,
          inline: true,
        },
        url: {
          name: 'Оригинал',
          value: itemUrl,
          inline: false,
        },
        categories: {
          name: 'Категории',
          value: equipment.categories.join(', '),
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

      embeds.main.setTitle(title).setURL(itemUrl);

      if (equipment.price) {
        embeds.main.addFields(fields.price);
      }

      if (equipment.weight) {
        embeds.main.addFields(fields.weight);
      }

      embeds.main
        .addFields(fields.source)
        .addFields(fields.categories)
        .addFields(fields.url)
        .setFooter({ text: footer });

      await interaction.followUp({
        embeds: [embeds.main],
      });

      if (equipment.description) {
        const description = getDescriptionEmbeds(equipment.description);

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

        const pagination = getPagination(interaction, embeds.desc);

        await pagination.render();
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

export default commandEquipment;
