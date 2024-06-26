import eslintParser from '@typescript-eslint/parser'
import recommendedTypeChecked from '@typescript-eslint/recommended-type-checked'
import stylisticTypeChecked from '@typescript-eslint/stylistic-type-checked'
import recommended from 'eslint:recommended'
import globals from 'globals'
import prettier from 'prettier'

export default [
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: eslintParser,
      parserOptions: {
        project: './tsconfig.lint.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2015,
      },
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended-type-checked',
      'plugin:@typescript-eslint/stylistic-type-checked',
      'prettier',
    ],
    plugins: {
      recommended,
      recommendedTypeChecked,
      stylisticTypeChecked,
      prettier,
    },
    rules: {
      semi: [2, 'never'],
    },
  },
]
