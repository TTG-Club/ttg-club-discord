import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloneDeep } from 'lodash-es';

import { useAxios } from '../../utils/useAxios.js';
import { useConfig } from '../../utils/useConfig.js';
import { useMarkdown } from '../../utils/useMarkdown.js';

import type { SlashCommand } from '../../types.js';
import type { TSpellItem, TSpellLink } from '../../types/Spell.js';

const http = useAxios();
const { API_URL } = useConfig();

const { getDescriptionEmbeds, getPagination } = useMarkdown();

const commandSpell: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('spell')
    .setDescription('Заклинания')
    .addStringOption((option) =>
      option
        .setName('name')
        .setNameLocalization('ru', 'название')
        .setDescription('Название заклинания')
        .setRequired(true)
        .setAutocomplete(true),
    ),
  autocomplete: async (interaction) => {
    try {
      const resp = await http.post<TSpellLink[]>({
        url: `/spells`,
        payload: {
          page: 0,
          size: 25,
          search: {
            value: interaction.options.getString('name') || '',
            exact: false,
          },
          order: [
            { field: 'level', direction: 'asc' },
            { field: 'name', direction: 'asc' },
          ],
        },
      });

      if (resp.status !== 200) {
        await interaction.respond([]);

        return;
      }

      await interaction.respond(
        resp.data.map((spell: TSpellLink) => {
          let name = spell.name.rus;

          if (spell.concentration) {
            name = `${name} [К]`;
          }

          if (spell.ritual) {
            name = `${name} [Р]`;
          }

          return {
            name: `[${spell.level || '-'}] ${name}`,
            value: spell.url,
          };
        }),
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
        await interaction.followUp('Название заклинания обязательно');

        return;
      }

      const resp = await http.post<TSpellItem>({ url });

      if (resp.status !== 200) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз',
        );

        return;
      }

      const spell = cloneDeep(resp.data);

      const components = [];

      if (spell.components.v) {
        components.push('вербальный');
      }

      if (spell.components.s) {
        components.push('соматический');
      }

      if (spell.components.m) {
        components.push(spell.components.m);
      }

      const title = `${spell.name.rus} [${spell.name.eng}]`;
      const spellUrl = `${API_URL}${spell.url}`;

      const footer = `TTG Club | ${spell.source.name} ${
        spell.source.page || ''
      }`.trim();

      const fields = {
        time: {
          name: 'Время накладывания',
          value: spell.ritual ? `${spell.time} (ритуал)` : spell.time,
          inline: false,
        },
        range: {
          name: 'Дистанция',
          value: spell.range,
          inline: false,
        },
        duration: {
          name: 'Длительность',
          value: spell.duration,
          inline: false,
        },
        level: {
          name: 'Уровень',
          value: !spell.level ? 'Заговор' : spell.level.toString(),
          inline: true,
        },
        source: {
          name: 'Источник',
          value: spell.source.shortName,
          inline: true,
        },
        school: {
          name: 'Школа',
          value: spell.school,
          inline: true,
        },
        components: {
          name: 'Компоненты',
          value: components.join(', '),
          inline: false,
        },
        url: {
          name: 'Оригинал',
          value: spellUrl,
          inline: false,
        },
        classes: {
          name: 'Классы',
          value: spell.classes?.length
            ? spell.classes.map((classItem) => classItem.name).join(', ')
            : '',
          inline: false,
        },
        subclasses: {
          name: 'Подклассы',
          value: spell.subclasses?.length
            ? spell.subclasses.map((classItem) => classItem.name).join(', ')
            : '',
          inline: false,
        },
      };

      const embed = new EmbedBuilder();

      embed
        .setTitle(title)
        .setURL(spellUrl)
        .addFields([
          fields.level,
          fields.school,
          fields.source,
          fields.time,
          fields.range,
          fields.duration,
          fields.components,
        ])
        .setFooter({
          text: footer,
        });

      if (spell.classes?.length) {
        embed.addFields(fields.classes);
      }

      if (spell.subclasses?.length) {
        embed.addFields(fields.subclasses);
      }

      embed.addFields(fields.url);

      const embeds = getDescriptionEmbeds(spell.description).map((str) =>
        new EmbedBuilder().setTitle('Описание').setDescription(str),
      );

      if (spell.upper) {
        embeds.push(
          ...getDescriptionEmbeds(spell.upper).map((str) =>
            new EmbedBuilder()
              .setTitle('На более высоких уровнях')
              .setDescription(str),
          ),
        );
      }

      await interaction.followUp({ embeds: [embed] });

      if (embeds.length <= 2) {
        await interaction.followUp({ embeds });

        return;
      }

      const pagination = getPagination(interaction, embeds);

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

export default commandSpell;
