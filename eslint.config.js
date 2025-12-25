import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      '.eslintrc.cjs',
      '.eslintignore'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      prettier: prettierPlugin
    },
    settings: {
      'import/resolver': {
        node: {
          paths: ['src']
        }
      }
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': ['error'],
      'no-console':
        process.env.NODE_ENV === 'production'
          ? ['error', { allow: ['warn', 'error'] }]
          : ['warn', { allow: ['warn', 'error'] }],
      'no-underscore-dangle': 'off',
      'no-use-before-define': 'off',
      'no-debugger': 'error',
      'no-alert': ['error'],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1, maxBOF: 1 }],
      'consistent-return': [1],
      'import/extensions': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/no-unresolved': 'off',
      'import/no-webpack-loader-syntax': 'off',
      'import/prefer-default-export': 'off',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          'warnOnUnassignedImports': false,
          'pathGroupsExcludedImportTypes': ['builtin'],
          'alphabetize': {
            order: 'asc',
            orderImportKind: 'asc',
            caseInsensitive: true
          },
          'groups': [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'unknown',
            'type',
            'object'
          ]
        }
      ],
      'import/no-cycle': [2, { maxDepth: 1 }],
      'no-continue': 'off',
      'no-await-in-loop': 'off',
      'no-nested-ternary': [1],
      'no-return-assign': [1],
      'no-bitwise': 'off',
      'no-plusplus': 'off',
      'no-restricted-syntax': [
        2,
        'ForInStatement',
        'LabeledStatement',
        'WithStatement'
      ],
      'no-unused-vars': 'off',
      'no-param-reassign': [
        'error',
        { props: true, ignorePropertyModificationsFor: ['state'] }
      ],
      'dot-notation': ['error'],
      'require-await': ['error'],
      'spaced-comment': ['error', 'always'],
      'camelcase': ['error'],
      'lines-between-class-members': [
        'error',
        'always',
        { exceptAfterSingleLine: false }
      ],
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: [
            'block-like',
            'break',
            'class',
            'const',
            'debugger',
            'directive',
            'export',
            'throw',
            'try',
            'function',
            'import'
          ],
          next: '*'
        },
        {
          blankLine: 'always',
          prev: '*',
          next: [
            'block-like',
            'break',
            'class',
            'const',
            'continue',
            'debugger',
            'directive',
            'return',
            'throw',
            'try',
            'export',
            'function',
            'import'
          ]
        },
        { blankLine: 'always', prev: 'block', next: 'block' },
        {
          blankLine: 'always',
          prev: '*',
          next: [
            'multiline-const',
            'multiline-expression',
            'multiline-let',
            'multiline-var'
          ]
        },
        { blankLine: 'never', prev: 'break', next: 'case' },
        { blankLine: 'never', prev: 'break', next: 'default' },
        { blankLine: 'any', prev: 'singleline-const', next: 'singleline-const' },
        { blankLine: 'any', prev: 'singleline-let', next: 'singleline-let' },
        { blankLine: 'any', prev: 'singleline-var', next: 'singleline-var' },
        { blankLine: 'any', prev: 'import', next: 'import' }
      ],
      'class-methods-use-this': ['error', { enforceForClassFields: false }],
      'no-shadow': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-shadow': ['error'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { args: 'after-used', ignoreRestSiblings: true }
      ],
      '@typescript-eslint/no-use-before-define': [
        'error',
        { typedefs: false, enums: false }
      ]
    }
  }
];

