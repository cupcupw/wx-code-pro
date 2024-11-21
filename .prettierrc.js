module.exports = {
  $schema: 'https://json.schemastore.org/prettierrc',
  semi: false,
  tabWidth: 2,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'all',
  vueIndentScriptAndStyle: true,
  overrides: [
    {
      files: '*.wxml',
      options: { parser: 'html' },
    },
    {
      files: '*.wxss',
      options: { parser: 'css' },
    },
    {
      files: '*.wxs',
      options: { parser: 'babel' },
    },
  ],
}
