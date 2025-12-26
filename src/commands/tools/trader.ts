import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloneDeep, sortBy } from 'lodash-es';

import type { HexColorString } from 'discord.js';

import { useAxios } from '../../utils/useAxios.js';
import { useConfig } from '../../utils/useConfig.js';

import type { SlashCommand } from '../../types.js';
import type {
  TArtifactLink,
  TArtifactRarityEnum,
} from '../../types/Artifact.js';
import type { TNameValue, TSource } from '../../types/BaseTypes.js';
import type { TSpellLink } from '../../types/Spell.js';

const http = useAxios();
const { API_URL } = useConfig();

interface IConfig {
  magicLevels: Array<TNameValue<number>>;
  sources: Array<TSource>;
}

interface IResponseData extends TArtifactLink {
  price: Record<string, number | null>;
  customization: true;
  spell?: TSpellLink;
}

const colors: {
  [key in TArtifactRarityEnum]: HexColorString;
} = {
  'common': '#ffffff',
  'uncommon': '#8aff91',
  'rare': '#a5f1ff',
  'very-rare': '#e770ff',
  'legendary': '#f6ff00',
  'artifact': '#ff8900',
  'unknown': '#35393D',
  'varies': '#ffc480',
};

const commandTrader: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('trader')
    .setDescription('Генератор лавки торговца')
    .addIntegerOption((option) =>
      option
        .setName('magic-level')
        .setNameLocalization('ru', 'магии')
        .setDescription('Количество магии в мире')
        .setAutocomplete(true)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('source')
        .setNameLocalization('ru', 'источник')
        .setDescription('Источник цены')
        .setAutocomplete(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('persuasion')
        .setNameLocalization('ru', 'убеждение')
        .setDescription('Результат проверки Харизмы (Убеждения)')
        .setMinValue(1),
    )
    .addBooleanOption((option) =>
      option
        .setName('unique')
        .setNameLocalization('ru', 'уникальные')
        .setDescription('Только уникальные предметы'),
    ),
  autocomplete: async (interaction) => {
    const { name } = interaction.options.getFocused(true);

    try {
      const { data } = await http.get<IConfig>({ url: `/tools/trader` });

      switch (name) {
        case 'source':
          if (!data.sources?.length) {
            await interaction.respond([]);

            return;
          }

          await interaction.respond(
            data.sources.map((source) => ({
              name: `[${source.shortName}]${source.homebrew ? ' [HB]' : ''} ${
                source.name
              }`,
              value: source.shortName,
            })),
          );

          break;
        case 'magic-level':
          if (!data.magicLevels?.length) {
            await interaction.respond([]);

            return;
          }

          await interaction.respond(data.magicLevels);

          break;
        default:
          await interaction.respond([]);

          break;
      }
    } catch (err) {
      console.error(err);

      await interaction.respond([]);
    }
  },
  execute: async (interaction) => {
    try {
      const persuasion = interaction.options.getInteger('persuasion') || 1;

      const magicLevel = interaction.options.getInteger('magic-level');

      const source =
        interaction.options.getString('source')?.toLowerCase() || 'dmg';

      if (typeof magicLevel !== 'number') {
        await interaction.followUp(
          'Поле "Количество магии" обязательно для заполнения',
        );

        return;
      }

      const unique = interaction.options.getBoolean('unique') ?? true;

      const {
        data: { magicLevels },
      } = await http.get<IConfig>({ url: `/tools/trader` });

      if (!magicLevels?.length) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз',
        );

        return;
      }

      if (
        !magicLevels.find(
          (level: { name: string; value: number }) =>
            level.value === magicLevel,
        )
      ) {
        await interaction.followUp('Поле "Количество магии" заполнено неверно');

        return;
      }

      const payload = {
        persuasion,
        magicLevel,
        unique,
      };

      const resp = await http.post<Array<IResponseData>>({
        url: `/tools/trader`,
        payload,
      });

      if (resp.status !== 200) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз',
        );

        return;
      }

      if (!Array.isArray(resp.data)) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз',
        );

        return;
      }

      if (!resp.data.length) {
        await interaction.followUp('Список товаров пуст...');

        return;
      }

      const order: {
        [key in TArtifactRarityEnum]: number;
      } = {
        'common': 0,
        'uncommon': 1,
        'rare': 2,
        'very-rare': 3,
        'legendary': 4,
        'artifact': 5,
        'unknown': 6,
        'varies': 7,
      };

      const results = sortBy(cloneDeep(resp.data), [
        (o) => order[o.rarity.type],
      ]);

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
              value: `[${artifact.rarity.short}] ${artifact.rarity.name}`,
              inline: true,
            })
            .addFields({
              name: 'Стоимость',
              value: `${artifact.price[source]} зм`,
              inline: true,
            })
            .addFields({
              name: 'Настройка',
              value: artifact.customization ? 'Да' : 'Нет',
              inline: true,
            })
            .addFields({
              name: 'Оригинал',
              value: `${API_URL}${artifact.url}`,
              inline: false,
            })
            .setURL(`${API_URL}${artifact.url}`)
            .setFooter({ text: 'TTG Club' });

          if (artifact.spell) {
            embed.addFields({
              name: 'Ссылка на заклинание',
              value: `${API_URL}${artifact.spell.url}`,
              inline: false,
            });
          }

          embeds.push(embed);
        }

        await interaction.followUp({ embeds });
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

export default commandTrader;
