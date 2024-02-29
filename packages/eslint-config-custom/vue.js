module.exports = {
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:vue/vue3-recommended'
  ],
  plugins: [
    'simple-import-sort',
    'import'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: require('./rules'),
};
