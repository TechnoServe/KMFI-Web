module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
  },
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  plugins: ['jsdoc'],
  extends: ['eslint:recommended', 'google'],
  rules: {
    'no-async-promise-executor': ['off'],
    'quotes': ['error', 'single'],
    'max-len': ['off'],
    'valid-jsdoc': ['off'],
    'operator-linebreak': ['error', 'before'],
    'indent': [
      'error',
      2,
      {
        ArrayExpression: 'first',
        SwitchCase: 1,
        offsetTernaryExpressions: true,
      },
    ],
    'comma-dangle': 'off',
    'space-before-function-paren': 'off',
  },
};
