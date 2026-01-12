import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloneDeep } from 'lodash-es';

import { useAxios } from '../../utils/useAxios.js';
import { useConfig } from '../../utils/useConfig.js';
import { useMarkdown } from '../../utils/useMarkdown.js';

import type { SlashCommand } from '../../types.js';
import type { TArmorItem, TArmorLink } from '../../types/Armor.js';

const http = useAxios();
const { API_URL } = useConfig();

const { getDescriptionEmbeds, getPagination } = useMarkdown();

const commandArmor: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('armor')
    .setDescription('Доспехи')
    .addStringOption((option) =>
      option
        .setName('name')
        .setNameLocalization('ru', 'название')
        .setDescription('Название доспеха')
        .setRequired(true)
        .setAutocomplete(true),
    ),
  autocomplete: async (interaction) => {
    try {
      const resp = await http.post<TArmorLink[]>({
        url: `/armors`,
        payload: {
          page: 0,
          size: 25,
          search: {
            value: interaction.options.getString('name') || '',
            exact: false,
          },
          order: [
            { field: 'AC', direction: 'asc' },
            { field: 'name', direction: 'asc' },
          ],
        },
      });

      if (resp.status !== 200) {
        await interaction.respond([]);

        return;
      }

      await interaction.respond(
        resp.data.map((armor: TArmorLink) => ({
          name: armor.name.rus,
          value: armor.url,
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
        await interaction.followUp('Название доспеха обязательно');

        return;
      }

      const resp = await http.post<TArmorItem>({ url });

      if (resp.status !== 200) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз',
        );

        return;
      }

      const armor = cloneDeep(resp.data);

      const title = `${armor.name.rus} [${armor.name.eng}]`;
      const armorUrl = `${API_URL}${url}`;

      const footer = `TTG Club | ${armor.source.name} ${
        armor.source.page || ''
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
        .setURL(armorUrl)
        .addFields({
          name: 'Тип',
          value: armor.type.name,
          inline: false,
        })
        .addFields({
          name: 'Класс доспеха (АС)',
          value: armor.armorClass,
          inline: false,
        })
        .addFields({
          name: 'Стоимость',
          value: armor.price,
          inline: true,
        })
        .addFields({
          name: 'Вес (в фунтах)',
          value: String(armor.weight),
          inline: true,
        })
        .addFields({
          name: 'Помеха на скрытность',
          value: armor.disadvantage ? 'да' : 'нет',
          inline: false,
        });

      if (armor.requirement) {
        embeds.main.addFields({
          name: 'Требование к силе',
          value: String(armor.requirement),
          inline: false,
        });
      }

      embeds.main
        .addFields({
          name: 'Надевание/Снятие',
          value: armor.duration,
          inline: false,
        })
        .addFields({
          name: 'Источник',
          value: armor.source.shortName,
          inline: false,
        })
        .addFields({
          name: 'Оригинал',
          value: armorUrl,
          inline: false,
        })
        .setFooter({ text: footer });

      await interaction.followUp({
        embeds: [embeds.main],
      });

      embeds.desc = getDescriptionEmbeds(armor.description).map((str) =>
        new EmbedBuilder().setTitle('Описание').setDescription(str),
      );

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

export default commandArmor;
