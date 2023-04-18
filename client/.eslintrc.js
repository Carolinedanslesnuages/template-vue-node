module.exports = {
  root: true,
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:cypress/recommended',
  ],
  plugins: [
    'vue',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  env: {
    'vue/setup-compiler-macros': true,
    browser: true,
    es2021: true,
  },
  rules: {
    'comma-dangle': [2, 'always-multiline'],
    'vue/no-v-html': 0,
    'no-irregular-whitespace': 0,
  },
  overrides: [
    {
      files: [
        'cypress/integration/**.spec.{js,ts,jsx,tsx}',
      ],
      extends: [
        'plugin:cypress/recommended',
      ],
    },
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/src/**/*.spec.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
    {
      files: ['**/src/**/*.e2e.js*'],
      globals: {
        cy: true,
      },
    },
  ],
}
