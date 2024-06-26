// @ts-check

import eslint from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ['**/*.ts'],
    ignores: ['node_modules', 'dist', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.lint.json',
        // projectService: {
        //   allowDefaultProject: ['./*.js'],
        //   defaultProject: './tsconfig.json',
        // },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2015,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      semi: [2, 'never'],
    },
  },
)
