/** @type {import('lint-staged').Config} */
export default {
  '*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}':
    'eslint --cache --cache-strategy content --quiet --fix',
  '*.{ts,tsx,cts,mts}': () => 'tsc --noEmit -p tsconfig.json',
};
