import type {
  CommandInteraction, EmbedBuilder, TextChannel
} from 'discord.js';
import { ButtonStyle } from 'discord.js';
import { Pagination } from 'discordjs-button-embed-pagination';
import sanitizeHtml from 'sanitize-html';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

import { useJSDom } from './useJSDom';

export const useMarkdown = () => {
  const turndownService = new TurndownService();

  turndownService.use(gfm);

  turndownService.addRule('strikethrough', {
    filter: 'p',
    replacement: content => `\n\n${ content }\n\n`
  });

  const getSanitized = (html: string) => {
    return sanitizeHtml(html, {
      transformTags: {
        'dice-roller': 'b'
      }
    });
  };

  const getMarkdown = (html: string) => {
    if (!html) {
      return '';
    }

    return turndownService.turndown(getSanitized(html));
  };

  const getMarkdownParagraphs = (html: string) => {
    const { getArrayParagraphs } = useJSDom();
    const array = getArrayParagraphs(html);

    return array.map(node => getMarkdown(node));
  };

  const getDescriptionEmbeds = (html: string) => {
    const rows = getMarkdownParagraphs(html);
    const embeds: string[] = [];

    let str = '';

    for (const row of rows) {
      if (str.length + row.length > 2048) {
        embeds.push(str.trim());
        str = '';
      }

      str += `\n\n${ row }`;
    }

    str = str.trim();

    if (embeds[embeds.length - 1] !== str) {
      embeds.push(str.trim());
    }

    return embeds.filter(row => !!row);
  };

  const getPagination = async (interaction: CommandInteraction, embeds: EmbedBuilder[]) => {
    const channel = interaction.channel || await interaction.client.channels.fetch(interaction.channelId);

    return new Pagination(
      channel as TextChannel,
      embeds,
      `Страница`,
      1000 * 60 * 5,
      [
        {
          label: '<<',
          style: ButtonStyle.Secondary
        },
        {
          label: '<',
          style: ButtonStyle.Primary
        },
        {
          label: 'стоп',
          style: ButtonStyle.Danger
        },
        {
          label: '>',
          style: ButtonStyle.Primary
        },
        {
          label: '>>',
          style: ButtonStyle.Secondary
        }
      ],
      interaction.user
    );
  };

  return {
    getSanitized,
    getMarkdown,
    getMarkdownParagraphs,
    getDescriptionEmbeds,
    getPagination
  };
};
