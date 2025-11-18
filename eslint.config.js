// @ts-check

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import pluginVitest from '@vitest/eslint-plugin';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  {
    ...pluginVitest.configs.recommended,
    files: ['**/*.test.ts'],
  },
  {
    name: 'app/files-to-lint',
    files: ['{packages,playgrounds}/**/*.{js,ts,mts,tsx,vue}'],
    languageOptions: {
      parserOptions: {
        project: [
          './packages/*/tsconfig.eslint.json',
        ],
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    ignores: ['eslint.config.js'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    settings: {
      'import/resolver': {
        'typescript': {
          project: [
            './packages/*/tsconfig.eslint.json'
          ],
        },
        'node': true,
      },
    },
    plugins: { '@stylistic': stylistic },
    rules: {
      //#region typescript-eslint
      '@typescript-eslint/no-empty-object-type': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-unsafe-argument': 0,
      '@typescript-eslint/no-unsafe-member-access': 0,
      '@typescript-eslint/no-unsafe-assignment': 0,
      '@typescript-eslint/no-unsafe-return': 0,
      '@typescript-eslint/no-redundant-type-constituents': 0,
      '@typescript-eslint/no-duplicate-type-constituents': 0,
      '@typescript-eslint/no-unused-expressions': 0,
      '@typescript-eslint/no-unsafe-call': 0,
      '@typescript-eslint/no-namespace': 0,
      '@typescript-eslint/require-await': 0,
      'no-empty': 0,
      //#endregion

      //#region import
      'import/order': ['error', {
        pathGroups: [
          { pattern: '@/**', group: 'internal', position: 'after' },
          { pattern: '~/**', group: 'external', position: 'after' },
        ],
        groups: [
          ['builtin', 'external'],
          'internal',
          'unknown',
          ['parent', 'sibling', 'index'],
          ['object']
        ],
        'newlines-between': 'always-and-inside-groups',
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
      }],
      'import/no-empty-named-blocks': ['error'],
      'import/enforce-node-protocol-usage': ['error', 'always'],
      'import/no-relative-packages': ['error'],
      'import/no-useless-path-segments': ['error'],
      //#endregion

      //#region stylistic
      '@stylistic/array-bracket-newline': ['error', 'consistent'],
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/array-element-newline': ['error', 'consistent'],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/arrow-spacing': ['error', { before: true, after: true }],
      '@stylistic/block-spacing': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/comma-spacing': ['error', { before: false, after: true }],
      '@stylistic/comma-style': ['error', 'last'],
      '@stylistic/computed-property-spacing': ['error', 'never'],
      '@stylistic/curly-newline': ['error', 'always'],
      '@stylistic/dot-location': ['error', 'property'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/function-call-spacing': ['error', 'never'],
      '@stylistic/function-paren-newline': ['error', 'consistent'],
      '@stylistic/generator-star-spacing': ['error', { before: false, after: true }],
      '@stylistic/implicit-arrow-linebreak': ['error', 'beside'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/indent-binary-ops': ['error', 2],
      '@stylistic/key-spacing': ['error', { beforeColon: false, afterColon: true, mode: 'strict' }],
      '@stylistic/keyword-spacing': ['error', { before: true, after: true }],
      '@stylistic/line-comment-position': ['error', { position: 'above' }],
      '@stylistic/linebreak-style': ['error', 'unix'],
      // '@stylistic/lines-around-comment': ['error', {}],
      '@stylistic/lines-between-class-members': ['error', {
        enforce: [
          { blankLine: 'always', prev: '*', next: 'field' },
          { blankLine: 'always', prev: 'field', next: 'field' },
          { blankLine: 'always', prev: 'field', next: 'method' },
          { blankLine: 'always', prev: 'method', next: 'method' },
        ],
      }],
      '@stylistic/max-len': ['warn', {
        code: 100,
        tabWidth: 2,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      }],
      '@stylistic/max-statements-per-line': ['error', { max: 1 }],
      '@stylistic/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
        multilineDetection: 'brackets',
      }],
      '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      '@stylistic/new-parens': ['error', 'always'],
      '@stylistic/newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
      '@stylistic/no-confusing-arrow': 'error',
      '@stylistic/no-extra-parens': 0,
      '@stylistic/no-extra-semi': 'error',
      '@stylistic/no-floating-decimal': 'error',
      '@stylistic/no-mixed-operators': 'error',
      '@stylistic/no-mixed-spaces-and-tabs': 'error',
      '@stylistic/no-multi-spaces': 'error',
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1, maxBOF: 0 }],
      '@stylistic/no-tabs': 'error',
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/no-whitespace-before-property': 'error',
      '@stylistic/nonblock-statement-body-position': ['error', 'beside'],
      '@stylistic/object-curly-newline': ['error', {
        multiline: true,
        consistent: true,
      }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
      '@stylistic/one-var-declaration-per-line': ['error', 'always'],
      '@stylistic/operator-linebreak': ['error', 'before', {
        overrides: {
          '=': 'after',
        },
      }],
      '@stylistic/padded-blocks': ['error', 'never'],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'directive', next: '*' },
        { blankLine: 'any', prev: 'directive', next: 'directive' },
        { blankLine: 'never', prev: ['case', 'default'], next: '*' },
      ],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/rest-spread-spacing': ['error', 'never'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/semi-spacing': ['error', { before: false, after: true }],
      '@stylistic/semi-style': ['error', 'last'],
      '@stylistic/space-before-blocks': ['error', 'always'],
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always',
        catch: 'always',
      }],
      '@stylistic/space-in-parens': ['error', 'never'],
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/space-unary-ops': ['error', { words: true, nonwords: false }],
      '@stylistic/spaced-comment': ['error', 'always', {
        markers: ['#region', '#endregion'], // Code wrapping.
      }],
      '@stylistic/switch-colon-spacing': ['error', { before: false, after: true }],
      '@stylistic/template-curly-spacing': ['error', 'never'],
      '@stylistic/template-tag-spacing': ['error', 'never'],
      '@stylistic/type-annotation-spacing': ['error'],
      '@stylistic/type-generic-spacing': ['error'],
      '@stylistic/type-named-tuple-spacing': ['error'],
      '@stylistic/wrap-iife': ['error', 'inside'],
      '@stylistic/yield-star-spacing': ['error', { before: false, after: true }],
      //#endregion
    },
  },
);
