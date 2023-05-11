import type {
  CommandInteraction, EmbedBuilder, TextChannel
} from 'discord.js';
import { ButtonStyle } from 'discord.js';
import { Pagination } from 'discordjs-button-embed-pagination';
import type sanitize from 'sanitize-html';
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

  turndownService.addRule('inlineLink', {
    filter: (node, options) => {
      return (
        options.linkStyle === 'inlined'
        && node.nodeName === 'A'
        && !!node.getAttribute('href')
      );
    },

    replacement: (content, node) => {
      let href: string | null = null;
      let title: string | null = null;

      if ('getAttribute' in node) {
        href = node.getAttribute('href');
        title = cleanAttribute(node.getAttribute('title'));
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
        'ul'
      ],
      transformTags: {
        'dice-roller': (_tagName, attribs) => {
          const newTag: sanitize.Tag = {
            attribs,
            tagName: 'b'
          };

          const attributes = Object.keys(attribs);

          if (attributes.includes('formula')) {
            newTag.text = attribs.formula;
          }

          if (attributes.includes(':formula')) {
            newTag.text = attribs[':formula'];
          }

          return newTag;
        },
        'a': (_tagName, attribs) => {
          const getUpdatedHref = (href: string) => {
            if (href.startsWith('http')) {
              return href;
            }

            return `${ API_URL || 'http://localhost:8080' }${ href }`;
          };

          const attributes = { ...attribs };

          if (attributes.href) {
            attributes.href = getUpdatedHref(attributes.href);
          }

          const newTag: sanitize.Tag = {
            tagName: 'a',
            attribs: attributes
          };

          return newTag;
        }
      }
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
