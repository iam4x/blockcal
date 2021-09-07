/* eslint-disable import/no-commonjs */
module.exports = {
  root: true,
  extends: ['algolia', 'algolia/react', 'algolia/typescript'],
  rules: {
    'import/order': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react/function-component-definition': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
