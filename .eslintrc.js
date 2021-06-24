// prettier-ignore
module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'rules': {
        'linebreak-style': ['error', 'windows'],
        'require-jsdoc': 'false'
  },
};
