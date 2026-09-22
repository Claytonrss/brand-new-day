import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default [
  // .worktrees contém checkouts irmãos com package.json próprios — lintá-los
  // quebra o gate no checkout principal (21k falsos no-extraneous-dependencies).
  { ignores: ['dist', 'playwright-report', 'test-results', 'node_modules', 'public', '.worktrees'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'smart'],
    },
  },
  {
    files: ['**/*.tsx'],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    // Anti-dependência-alucinada: import precisa resolver e estar declarado
    // em package.json (tsc/vite pegam no gate; isso pega antes, no lint).
    files: ['**/*.{js,mjs,ts,tsx}'],
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
      },
    },
    rules: {
      'import/no-unresolved': ['error', { commonjs: false }],
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['tests/**', 'scripts/**', '**/*.config.*', 'eslint.config.js'] },
      ],
    },
  },
  {
    files: ['**/*.mjs', '**/*.config.ts', '**/scripts/**'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
];
