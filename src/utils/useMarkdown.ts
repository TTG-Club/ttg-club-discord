import { gfm } from '@truto/turndown-plugin-gfm';
import { ButtonStyle } from 'discord.js';
import { Pagination } from 'discordjs-button-embed-pagination';
import sanitizeHtml from 'sanitize-html';
import TurndownService from 'turndown';

import type {
  ChatInputCommandInteraction,
  DMChannel,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';

import { useConfig } from './useConfig.js';
import { useJSDom } from './useJSDom.js';

const { API_URL } = useConfig();

export function useMarkdown() {
  const turndownService = new TurndownService({
    bulletListMarker: '-',
  });

  const cleanAttribute = (attribute: string | null) =>
    attribute ? attribute.replace(/(?:\n\s*)+/g, '\n') : '';

  turndownService.use(gfm);

  turndownService.addRule('paragraph', {
    filter: 'p',
    replacement: (content) => `\n\n${content}\n\n`,
  });

  turndownService.addRule('diceRoller', {
    filter: (node) => node.nodeName === 'DICE-ROLLER',
    replacement: (content, node, options) => {
      let text = '';

      if ('getAttribute' in node && node.getAttribute('formula')) {
        text = `${options.strongDelimiter}${node.getAttribute('formula')}${
          options.strongDelimiter
        }`;
      }

      if ('getAttribute' in node && node.getAttribute(':formula')) {
        text = `${options.strongDelimiter}${node.getAttribute('formula')}${
          options.strongDelimiter
        }`;
      }

      if (content) {
        text = `${options.strongDelimiter}${content}${options.strongDelimiter}`;
      }

      return text;
    },
  });

  turndownService.addRule('inlineLink', {
    filter: (node, options) =>
      options.linkStyle === 'inlined'
      && node.nodeName === 'A'
      && !!node.getAttribute('href'),

    replacement: (content, node) => {
      const getUpdatedHref = (href: string) => {
        if (href.startsWith('http')) {
          return href;
        }

        return `${API_URL || 'http://localhost:8080'}${href}`;
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
        title = ` "${title}"`;
      }

      return `[${content}](${href}${title || ''})`;
    },
  });

  const getSanitized = (html: string) =>
    sanitizeHtml(html, {
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
        'dice-roller',
      ],
    });

  const getMarkdown = (html: string) => {
    if (!html) {
      return '';
    }

    const sanitized = getSanitized(html);

    return turndownService
      .turndown(sanitized)
      .replace(/\\\[/g, '[')
      .replace(/\\\]/g, ']');
  };

  const getMarkdownParagraphs = (html: string) => {
    const { getArrayParagraphs } = useJSDom();
    const array = getArrayParagraphs(html);

    return array.map((node) => getMarkdown(node));
  };

  const getDescriptionEmbeds = (html: string) => {
    const rows = getMarkdownParagraphs(html).filter((row) => !!row);

    const embeds: string[] = [];

    let str = '';

    for (const row of rows) {
      if (str.length + row.length > 2048) {
        embeds.push(str.trim());
        str = '';
      }

      str += `\n\n${row}`;
    }

    str = str.trim();

    if (embeds[embeds.length - 1] !== str) {
      embeds.push(str.trim());
    }

    return embeds.filter((row) => !!row);
  };

  const getPagination = async (
    interaction: ChatInputCommandInteraction,
    embeds: EmbedBuilder[],
  ) => {
    const channel =
      interaction.channel
      || (await interaction.client.channels.fetch(interaction.channelId));

    if (!channel) {
      throw new Error('Channel is not available');
    }

    function isTextOrDMChannel(
      ch: NonNullable<typeof channel>,
    ): ch is TextChannel | DMChannel {
      return 'send' in ch || 'messages' in ch;
    }

    if (!isTextOrDMChannel(channel)) {
      throw new Error('Channel is not a text channel or DM channel');
    }

    // Примечание: из-за несовместимости версий discord.js и discordjs-button-embed-pagination
    // требуется приведение типа. Это известная проблема библиотеки.
    // Используем двойное приведение через unknown для обхода проблем совместимости типов
    const compatibleChannel = channel as unknown as TextChannel | DMChannel;

    return new Pagination(
      // @ts-ignore - несовместимость версий discord.js и discordjs-button-embed-pagination
      compatibleChannel,
      embeds,
      `Страница`,
      1000 * 60 * 5,
      [
        {
          label: '<<',
          style: ButtonStyle.Secondary,
        },
        {
          label: '<',
          style: ButtonStyle.Primary,
        },
        {
          label: 'стоп',
          style: ButtonStyle.Danger,
        },
        {
          label: '>',
          style: ButtonStyle.Primary,
        },
        {
          label: '>>',
          style: ButtonStyle.Secondary,
        },
      ],
      // Примечание: из-за несовместимости версий discord.js и discordjs-button-embed-pagination
      // требуется приведение типа. Это известная проблема библиотеки.
      interaction.user as unknown as typeof interaction.user,
    );
  };

  return {
    getSanitized,
    getMarkdown,
    getMarkdownParagraphs,
    getDescriptionEmbeds,
    getPagination,
  };
}
