import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cloneDeep } from 'lodash-es';

import { useAxios } from '../../utils/useAxios.js';
import { useConfig } from '../../utils/useConfig.js';
import { useJSDom } from '../../utils/useJSDom.js';
import { useMarkdown } from '../../utils/useMarkdown.js';

import type { TRaceItem, TRaceLink } from '../../types/Race.js';
import type { SlashCommand } from '../../types.js';

const http = useAxios();
const { API_URL } = useConfig();

const { getDescriptionEmbeds, getPagination } = useMarkdown();

const { getHTMLArrayFromPairs } = useJSDom();

const commandRace: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('race')
    .setDescription('Расы и происхождения')
    .addStringOption(option =>
      option
        .setName('name')
        .setNameLocalization('ru', 'название')
        .setDescription('Название расы')
        .setRequired(true)
        .setAutocomplete(true)
    ),
  autocomplete: async interaction => {
    try {
      const resp = await http.post<TRaceLink[]>({
        url: `/races`,
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

      const races = cloneDeep(resp.data);

      await interaction.respond(
        races.map((race: TRaceLink) => ({
          name: race.name.rus,
          value: race.url
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

      const resp = await http.post<TRaceItem>({ url });

      if (resp.status !== 200) {
        await interaction.followUp(
          'Произошла какая-то ошибка... попробуй еще раз'
        );

        return;
      }

      const race = cloneDeep(resp.data);

      const title = `${race.name.rus} [${race.name.eng}]`;
      const raceUrl = `${API_URL}${url}`;

      const footer = `TTG Club | ${race.source.name} ${
        race.source.page || ''
      }`.trim();

      const embeds: {
        main: EmbedBuilder;
        desc: EmbedBuilder[];
      } = {
        main: new EmbedBuilder(),
        desc: []
      };

      embeds.main
        .setTitle(title)
        .setURL(raceUrl)
        .setThumbnail(race.image)
        .addFields({
          name: 'Источник',
          value: race.source.shortName,
          inline: true
        })
        .addFields({
          name: 'Тип',
          value: race.type,
          inline: true
        })
        .addFields({
          name: 'Размер',
          value: race.size,
          inline: true
        })
        .addFields({
          name: 'Характеристики',
          value: race.abilities
            .map(ability =>
              ability.value
                ? `${ability.shortName} ${
                    ability.value > 0 ? `+${ability.value}` : ability.value
                  }`
                : ability.name
            )
            .join(', '),
          inline: true
        })
        .addFields({
          name: 'Скорость',
          value: race.speed
            .map(
              speed => `${speed.name ? `${speed.name} ` : ''}${speed.value} фт.`
            )
            .join(', '),
          inline: true
        })
        .setFooter({ text: footer });

      if (race.darkvision) {
        embeds.main.addFields({
          name: 'Темное зрение',
          value: `${race.darkvision} фт.`,
          inline: false
        });
      }

      if (race.subraces?.length) {
        embeds.main.addFields({
          name: 'Разновидности',
          value: race.subraces.map(subrace => subrace.name.rus).join(', '),
          inline: false
        });
      }

      await interaction.followUp({
        embeds: [embeds.main]
      });

      const skills = getHTMLArrayFromPairs(
        race.skills.map(skill => ({
          name: skill.name,
          value: skill.description
        }))
      );

      embeds.desc = getDescriptionEmbeds(skills).map(str =>
        new EmbedBuilder().setDescription(str)
      );

      embeds.desc.push(
        ...getDescriptionEmbeds(race.description).map(str =>
          new EmbedBuilder().setTitle('Описание').setDescription(str)
        )
      );

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

export default commandRace;
