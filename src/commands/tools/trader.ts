import type { SlashCommand } from '../../types';
import type {
  TArtifactLink, TArtifactRarity
} from '../../types/Artifact';
import type { TSpellLink } from '../../types/Spell';
import type { HexColorString } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import _ from 'lodash';
import * as console from 'node:console';

import { useAxios } from '../../utils/useAxios';
import { useConfig } from '../../utils/useConfig';

const http = useAxios();
const { API_URL } = useConfig();

interface IResponseData extends TArtifactLink {
  price: number;
  customization: true;
  spell?: TSpellLink
}

const colors: {
  [key in TArtifactRarity['type']]: HexColorString
} = {
  'common': '#fff',
  'uncommon': '#8aff91',
  'rare': '#a5f1ff',
  'very-rare': '#e770ff',
  'legendary': '#f6ff00',
  'artifact': '#ff8900',
  'unknown': '#35393D',
  'varies': '#ffc480'
};

const commandTrader: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('trader')
    .setDescription('Генератор лавки торговца')
    .addIntegerOption(option => option
      .setName('magic-level')
      .setNameLocalization('ru', 'магии')
      .setDescription('Количество магии в мире')
      .setAutocomplete(true)
      .setRequired(true))
    .addIntegerOption(option => option
      .setName('persuasion')
      .setNameLocalization('ru', 'убеждение')
      .setDescription('Результат проверки Харизмы (Убеждения)')
      .setMinValue(1))
    .addBooleanOption(option => option
      .setName('unique')
      .setNameLocalization('ru', 'уникальные')
      .setDescription('Только уникальные предметы')),
  autocomplete: async interaction => {
    try {
      const resp = await http.get({ url: `/tools/trader` });

      if (resp.status !== 200) {
        await interaction.respond([]);

        return;
      }

      await interaction.respond(_.cloneDeep(resp.data));
    } catch (err) {
      console.error(err);

      await interaction.respond([]);
    }
  },
  execute: async interaction => {
    try {
      // @ts-ignore
      const persuasion = interaction.options.getInteger('persuasion') as number || 1;

      // @ts-ignore
      const magicLevel = interaction.options.getInteger('magic-level') as number || null;

      // @ts-ignore
      const unique = interaction.options.getBoolean('unique') as boolean || true;

      if (!magicLevel) {
        await interaction.followUp('Поле "Количество магии" обязательно для заполнения');

        return;
      }

      const payload = {
        persuasion,
        magicLevel,
        unique
      };

      const resp = await http.post({
        url: `/tools/trader`,
        payload
      });

      if (resp.status !== 200) {
        await interaction.followUp('Произошла какая-то ошибка... попробуй еще раз');

        return;
      }

      if (!(resp.data instanceof Array) || !resp.data.length) {
        await interaction.followUp('Произошла какая-то ошибка... попробуй еще раз');

        return;
      }

      const order: {
        [key in TArtifactLink['rarity']['type']]: number
      } = {
        'common': 0,
        'uncommon': 1,
        'rare': 2,
        'very-rare': 3,
        'legendary': 4,
        'artifact': 5,
        'unknown': 6,
        'varies': 7
      };

      const results: Array<IResponseData> = _.sortBy(
        _.cloneDeep<Array<IResponseData>>(resp.data),
        [o => order[o.rarity.type]]
      );

      const chunkSize = 5;

      for (let i = 0; i < results.length; i += chunkSize) {
        const chunk = results.slice(i, i + chunkSize);

        const embeds = [];

        for (const artifact of chunk) {
          const embed = new EmbedBuilder()
            .setColor(colors[artifact.rarity.type])
            .setTitle(artifact.name.rus)
            .setDescription(artifact.name.eng)
            .addFields({
              name: 'Редкость',
              value: `[${ artifact.rarity.short }] ${ artifact.rarity.name }`,
              inline: true
            })
            .addFields({
              name: 'Стоимость',
              value: `${ artifact.price } зм`,
              inline: true
            })
            .addFields({
              name: 'Настройка',
              value: artifact.customization ? 'Да' : 'Нет',
              inline: true
            })
            .addFields({
              name: 'Оригинал',
              value: `${ API_URL }${ artifact.url }`,
              inline: false
            })
            .setURL(`${ API_URL }${ artifact.url }`)
            .setFooter({ text: 'TTG Club' });

          if (artifact.spell) {
            embed.addFields({
              name: 'Ссылка на заклинание',
              value: `${ API_URL }${ artifact.spell.url }`,
              inline: false
            });
          }

          embeds.push(embed);
        }

        await interaction.followUp({ embeds });
      }
    } catch (err) {
      console.error(err);
      await interaction.followUp('Произошла какая-то ошибка... попробуй еще раз');
    }
  },
  cooldown: 10
};

export default commandTrader;
