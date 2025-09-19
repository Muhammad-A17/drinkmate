const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react-hooks/exhaustive-deps': 'off', // Turn off exhaustive deps warnings
      'react/no-unescaped-entities': 'off',
      '@next/next/no-html-link-for-pages': 'warn',
      '@next/next/no-img-element': 'off', // Turn off image optimization warnings
      'react-hooks/rules-of-hooks': 'error',
      'prefer-const': 'off', // Turn off prefer-const warnings
      'import/no-anonymous-default-export': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
];
