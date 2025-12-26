import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloneDeep } from 'lodash-es';

import { useAxios } from '../../utils/useAxios.js';
import { useConfig } from '../../utils/useConfig.js';
import { useMarkdown } from '../../utils/useMarkdown.js';

import type { SlashCommand } from '../../types.js';
import type { TWeaponItem, TWeaponLink } from '../../types/Weapon.js';

const http = useAxios();
const { API_URL } = useConfig();

const { getDescriptionEmbeds, getPagination } = useMarkdown();

const commandWeapon: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('weapon')
    .setDescription('Оружие')
    .addStringOption((option) =>
      option
        .setName('name')
        .setNameLocalization('ru', 'название')
        .setDescription('Название оружия')
        .setRequired(true)
        .setAutocomplete(true),
    ),
  autocomplete: async (interaction) => {
    try {
      const resp = await http.post<TWeaponLink[]>({
        url: `/weapons`,
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

      const weapons = cloneDeep(resp.data);

      await interaction.respond(
        weapons.map((weapon: TWeaponLink) => ({
          name: weapon.name.rus,
          value: weapon.url,
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

      const resp = await http.post<TWeaponItem>({ url });

      if (resp.status !== 200) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз',
        );

        return;
      }

      const weapon = cloneDeep(resp.data);

      const title = `${weapon.name.rus} [${weapon.name.eng}]`;
      const weaponUrl = `${API_URL}${url}`;

      const footer = `TTG Club | ${weapon.source.name} ${
        weapon.source.page || ''
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
        .setURL(weaponUrl)
        .addFields({
          name: 'Стоимость',
          value: weapon.price,
          inline: true,
        })
        .addFields({
          name: 'Урон',
          value: `${weapon.damage.dice} ${weapon.damage.type}`,
          inline: true,
        })
        .addFields({
          name: 'Вес (в фунтах)',
          value: String(weapon.weight),
          inline: true,
        })
        .addFields({
          name: 'Тип',
          value: weapon.type.name,
          inline: false,
        })
        .addFields({
          name: 'Свойства',
          value: weapon.properties
            .map(
              (prop) =>
                `${prop.name}${
                  prop.twoHandDice ? ` (${prop.twoHandDice})` : ''
                }${prop.distance ? ` (дис. ${prop.distance}` : ''}`,
            )
            .join(', '),
          inline: false,
        })
        .addFields({
          name: 'Источник',
          value: weapon.source.shortName,
          inline: false,
        })
        .addFields({
          name: 'Оригинал',
          value: weaponUrl,
          inline: false,
        })
        .setFooter({ text: footer });

      await interaction.followUp({
        embeds: [embeds.main],
      });

      if (weapon.description) {
        embeds.desc = getDescriptionEmbeds(weapon.description).map((str) =>
          new EmbedBuilder().setTitle('Описание').setDescription(str),
        );
      }

      if (weapon.special) {
        embeds.desc.push(
          ...getDescriptionEmbeds(weapon.special).map((str) =>
            new EmbedBuilder().setTitle('Особое свойство').setDescription(str),
          ),
        );
      }

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

export default commandWeapon;
