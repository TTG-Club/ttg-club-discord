import type {
  CommandInteraction, EmbedBuilder, TextChannel
} from 'discord.js';
import { ButtonStyle } from 'discord.js';
import { Pagination } from 'discordjs-button-embed-pagination';
import sanitizeHtml from 'sanitize-html';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

import { useConfig } from './useConfig';
import { useJSDom } from './useJSDom';

const { API_URL } = useConfig();

export const useMarkdown = () => {
  const turndownService = new TurndownService({
    bulletListMarker: '-'
  });

  const cleanAttribute = (attribute: string | null) => {
    return attribute ? attribute.replace(/(\n+\s*)+/g, '\n') : '';
  };

  turndownService.use(gfm);

  turndownService.addRule('paragraph', {
    filter: 'p',
    replacement: content => `\n\n${ content }\n\n`
  });

  turndownService.addRule('diceRoller', {
    filter: node => (node.nodeName === 'DICE-ROLLER'),
    replacement: (content, node, options) => {
      let text = '';

      if ('getAttribute' in node && node.getAttribute('formula')) {
        text = `${ options.strongDelimiter }${ node.getAttribute('formula') }${ options.strongDelimiter }`;
      }

      if ('getAttribute' in node && node.getAttribute(':formula')) {
        text = `${ options.strongDelimiter }${ node.getAttribute('formula') }${ options.strongDelimiter }`;
      }

      if (content) {
        text = `${ options.strongDelimiter }${ content }${ options.strongDelimiter }`;
      }

      return text;
    }
  });

  turndownService.addRule('inlineLink', {
    filter: (node, options) => {
      return (
        options.linkStyle === 'inlined'
        && node.nodeName === 'A'
        && !!node.getAttribute('href')
      );
    },

    replacement: (content, node) => {
      const getUpdatedHref = (href: string) => {
        if (href.startsWith('http')) {
          return href;
        }

        return `${ API_URL || 'http://localhost:8080' }${ href }`;
      };

      let href: string | null = null;
      let title: string | null = null;

      if ('getAttribute' in node) {
        href = node.getAttribute('href');
        title = cleanAttribute(node.getAttribute('title'));
      }

      if (href) {
        href = getUpdatedHref(href);
      }

      if (title) {
        title = ' "' + title + '"';
      }

      return `[${ content }](${ href }${ title || '' })`;
    }
  });

  const getSanitized = (html: string) => {
    return sanitizeHtml(html, {
      allowedTags: [
        'a',
        'abbr',
        'b',
        'blockquote',
        'br',
        'caption',
        'code',
        'col',
        'colgroup',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'hr',
        'i',
        'li',
        'ol',
        'p',
        'pre',
        's',
        'section',
        'span',
        'strong',
        'table',
        'tbody',
        'td',
        'tfoot',
        'th',
        'thead',
        'tr',
        'u',
        'ul',
        'dice-roller'
      ]
    });
  };

  const getMarkdown = (html: string) => {
    if (!html) {
      return '';
    }

    const sanitized = getSanitized(html);

    return turndownService.turndown(sanitized)
      .replace(/\\\[/g, '[')
      .replace(/\\]/g, ']');
  };

  const getMarkdownParagraphs = (html: string) => {
    const { getArrayParagraphs } = useJSDom();
    const array = getArrayParagraphs(html);

    return array.map(node => getMarkdown(node));
  };

  const getDescriptionEmbeds = (html: string) => {
    const rows = getMarkdownParagraphs(html)
      .filter(row => !!row);

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
