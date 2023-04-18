module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    jest: true,
    node: true,
  },
  extends: [
    'standard',
    'eslint:recommended',
  ],
  plugins: [
    '@babel',
    'n',
    'promise',
    'import',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'comma-dangle': [2, 'always-multiline'],
    'no-irregular-whitespace': 0,
  },
}
