// Lint for the Node code at the root: the mock now, the Express server from PA#4. The client keeps its own config
// (client/eslint.config.js). tools/contract-check.mjs comes from the course and is never edited, so it is not linted.
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['client/**', 'tools/contract-check.mjs', '**/node_modules/**', '**/dist/**', 'design-system/**'] },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.node },
    rules: { ...js.configs.recommended.rules },
  },
];
