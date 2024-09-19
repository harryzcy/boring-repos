// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['bin/', '*.config.js', '*.config.ts', 'dist/', 'node_modules/'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2020,
      },
    },
    rules: {
      semi: [2, 'never'],
    },
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
)

// import eslint from '@eslint/js'
// import globals from 'globals'
// import path from 'path'
// import tseslint from 'typescript-eslint'
// import { fileURLToPath } from 'url'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// export default tseslint.config(
//   eslint.configs.recommended,
//   ...tseslint.configs.recommendedTypeChecked,
//   ...tseslint.configs.stylisticTypeChecked,
//   {
//     files: ['**/*.ts'],
//     languageOptions: {
//       ecmaVersion: 2020,
//       sourceType: 'module',
//       parserOptions: {
//         project: './tsconfig.lint.json',
//         tsconfigRootDir: __dirname,
//       },
//       globals: {
//         ...globals.browser,
//         ...globals.node,
//         ...globals.es2015,
//       },
//     },
//     rules: {
//       semi: [2, 'never'],
//     },
//   },
// )
