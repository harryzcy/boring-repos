const plugins = []

try {
  plugins.push(await import('prettier-plugin-organize-imports'))
} catch (error) {
  console.warn('Error loading prettier-plugin-organize-imports:', error)
}

const config = {
  trailingComma: 'none',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  overrides: [
    {
      files: ['*.ts', '*.mts'],
      options: {
        parser: 'typescript',
      },
    },
  ],
  plugins,
}

export default config
