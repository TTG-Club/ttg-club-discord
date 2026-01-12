import { gfm } from '@truto/turndown-plugin-gfm';
import { ButtonStyle } from 'discord.js';
import { Pagination } from 'pagination.djs';
import sanitizeHtml from 'sanitize-html';
import TurndownService from 'turndown';

import { useConfig } from './useConfig.js';
import { useJSDom } from './useJSDom.js';

import type {
  EmbedBuilder,
  Interaction,
  InteractionType,
  Message,
} from 'discord.js';

const { SITE_URL } = useConfig();

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
      options.linkStyle === 'inlined' &&
      node.nodeName === 'A' &&
      !!node.getAttribute('href'),

    replacement: (content, node) => {
      const getUpdatedHref = (href: string) => {
        if (href.startsWith('http')) {
          return href;
        }

        return `${SITE_URL || 'http://localhost:8080'}${href}`;
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

  const getPagination = (
    interaction:
      | Exclude<
          Interaction,
          { type: InteractionType.ApplicationCommandAutocomplete }
        >
      | Message,
    embeds: EmbedBuilder[],
  ) => {
    const pagination = new Pagination(interaction);

    pagination.setButtonAppearance({
      first: {
        label: '<<',
        emoji: '',
        style: ButtonStyle.Secondary,
      },
      prev: {
        label: '<',
        emoji: '',
        style: ButtonStyle.Primary,
      },
      next: {
        label: '>',
        emoji: '',
        style: ButtonStyle.Primary,
      },
      last: {
        label: '>>',
        emoji: '',
        style: ButtonStyle.Secondary,
      },
    });

    pagination.setEmbeds(embeds);

    return pagination;
  };

  return {
    getSanitized,
    getMarkdown,
    getMarkdownParagraphs,
    getDescriptionEmbeds,
    getPagination,
  };
}
