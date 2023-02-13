import type { SlashCommand } from '../../types';
import type { TRuleItem, TRuleLink } from '../../types/Rules';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import _ from 'lodash';
import * as console from 'node:console';

import { useAxios } from '../../utils/useAxios';
import { useConfig } from '../../utils/useConfig';
import { useMarkdown } from '../../utils/useMarkdown';

const http = useAxios();
const { API_URL } = useConfig();
const { getDescriptionEmbeds, getPagination } = useMarkdown();

const commandRule: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('rule')
    .setDescription('Правила и термины')
    .addStringOption(option => option
      .setName('name')
      .setNameLocalization('ru', 'название')
      .setDescription('Название правила или термина')
      .setRequired(true)
      .setAutocomplete(true)),
  autocomplete: async interaction => {
    try {
      const resp = await http.post({
        url: `/rules`,
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

      const rules: TRuleLink[] = _.cloneDeep(resp.data);

      await interaction.respond(rules.map((rule: TRuleLink) => ({
        name: rule.name.rus,
        value: rule.url
      })));
    } catch (err) {
      console.error(err);
      await interaction.respond([]);
    }
  },
  execute: async interaction => {
    try {
      // @ts-ignore
      const url = interaction.options.getString('name');

      const resp = await http.post({ url });

      if (resp.status !== 200) {
        await interaction.followUp('Произошла какая-то ошибка... попробуй еще раз');

        return;
      }

      const rule: TRuleItem = _.cloneDeep(resp.data);

      const title = `${ rule.name.rus } [${ rule.name.eng }]`;
      const ruleUrl = `${ API_URL }${ url }`;
      const footer = `TTG Club | ${ rule.source.name } ${ rule.source.page || '' }`.trim();
      const description = getDescriptionEmbeds(rule.description);

      const fields = {
        category: {
          name: 'Категория',
          value: rule.type,
          inline: true
        },
        source: {
          name: 'Источник',
          value: rule.source.shortName,
          inline: true
        },
        url: {
          name: 'Оригинал',
          value: ruleUrl,
          inline: false
        }
      };

      const embeds: {
        main: EmbedBuilder,
        desc: EmbedBuilder[]
      } = {
        main: new EmbedBuilder(),
        desc: []
      };

      embeds.main
        .setTitle(title)
        .setURL(ruleUrl)
        .addFields(fields.category)
        .addFields(fields.source)
        .addFields(fields.url)
        .setFooter({ text: footer });

      const descLength = description.length;

      embeds.desc = description.map((str, index) => {
        const embed = new EmbedBuilder()
          .setDescription(str);

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
      await interaction.followUp('Произошла какая-то ошибка... попробуй еще раз');
    }
  },
  cooldown: 10
};

export default commandRule;
