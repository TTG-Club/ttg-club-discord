import { configure } from '@svifty7/eslint-config';

export default configure({
  formatters: true,
  gitignore: true,
  jsdoc: true,
  jsonc: true,
  jsx: {
    a11y: true,
  },
  markdown: true,
  pnpm: true,
  test: true,
  toml: true,
  typescript: true,
  yaml: true,
  ignores: ['.agents', 'AGENTS.md'],
});
