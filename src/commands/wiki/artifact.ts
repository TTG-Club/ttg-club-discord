import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloneDeep } from 'lodash-es';

import { useAxios } from '../../utils/useAxios.js';
import { useConfig } from '../../utils/useConfig.js';
import { useMarkdown } from '../../utils/useMarkdown.js';

import type { TArtifactItem, TArtifactLink } from '../../types/Artifact.js';
import type { SlashCommand } from '../../types.js';

const http = useAxios();
const { API_URL } = useConfig();

const { getDescriptionEmbeds, getPagination } = useMarkdown();

const commandArtifact: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('artifact')
    .setDescription('Магические предметы')
    .addStringOption(option =>
      option
        .setName('name')
        .setNameLocalization('ru', 'название')
        .setDescription('Название предмета')
        .setRequired(true)
        .setAutocomplete(true)
    ),
  autocomplete: async interaction => {
    try {
      const resp = await http.post<TArtifactLink[]>({
        url: `/items/magic`,
        payload: {
          page: 0,
          limit: 10,
          search: {
            value: interaction.options.getString('name'),
            exact: false
          },
          order: [
            {
              field: 'rarity',
              direction: 'asc'
            },
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

      const artifacts = cloneDeep(resp.data);

      await interaction.respond(
        artifacts.map((artifact: TArtifactLink) => ({
          name: `[${artifact.rarity.short}] ${artifact.name.rus}`,
          value: artifact.url
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

      const resp = await http.post<TArtifactItem>({ url });

      if (resp.status !== 200) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз'
        );

        return;
      }

      const artifact = cloneDeep(resp.data);

      const title = `${artifact.name.rus} [${artifact.name.eng}]`;
      const artifactUrl = `${API_URL}${url}`;
      const thumbnail = artifact.images?.length ? artifact.images[0] : null;

      const footer = `TTG Club | ${artifact.source.name} ${
        artifact.source.page || ''
      }`.trim();

      const embeds: {
        main: EmbedBuilder;
        desc: EmbedBuilder[];
      } = {
        main: new EmbedBuilder(),
        desc: []
      };

      embeds.main.setTitle(title).setURL(artifactUrl).addFields({
        name: 'Источник',
        value: artifact.source.shortName,
        inline: false
      });

      if (artifact.cost) {
        embeds.main
          .addFields({
            name: 'Стоимость DMG',
            value: artifact.cost.dmg,
            inline: false
          })
          .addFields({
            name: 'Стоимость XGE',
            value: `${artifact.cost.xge}${
              artifact.cost.xge === 'невозможно купить' ? '' : ' зм.'
            }`,
            inline: false
          });
      }

      embeds.main
        .addFields({
          name: 'Тип',
          value: `${artifact.type.name}${
            artifact.detailType?.length
              ? ` (${artifact.detailType.join(', ')})`
              : ''
          }`,
          inline: false
        })
        .addFields({
          name: 'Редкость',
          value: artifact.rarity.name,
          inline: false
        })
        .addFields({
          name: 'Настройка',
          value: `${artifact.customization ? 'требуется настройка' : 'нет'}${
            artifact.detailCustamization?.length
              ? ` (${artifact.detailCustamization.join(', ')})`
              : ''
          }`,
          inline: false
        })
        .addFields({
          name: 'Оригинал',
          value: artifactUrl,
          inline: false
        })
        .setFooter({ text: footer });

      if (thumbnail) {
        embeds.main.setThumbnail(thumbnail);
      }

      await interaction.followUp({
        embeds: [embeds.main]
      });

      const description = getDescriptionEmbeds(artifact.description);

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
        'Произошла какая-то ошибка... попробуй еще раз'
      );
    }
  },
  cooldown: 10
};

export default commandArtifact;
