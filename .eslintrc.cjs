module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    './eslintrc-auto-import.json',
    'airbnb-base',
    'plugin:vue/vue3-essential',
    'plugin:prettier/recommended',
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 0,
    'vue/multi-word-component-names': [
      'error',
      {
        ignores: ['index', '403', '404', '500'], // 需要忽略的组件名
      },
    ],
    // 放宽规则，减少开发时波浪线干扰
    'no-console': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-param-reassign': 'off',
    'new-cap': 'off',
    'import/order': 'off',
    'import/first': 'off',
    'spaced-comment': 'off',
    'padding-line-between-statements': 'off',
    'import/newline-after-import': 'off',
    'object-curly-newline': 'off',
    'import/no-mutable-exports': 'off',
    // 处理 prettier 和 eslint 冲突的规则
    'prettier/prettier': [
      'error',
      {
        printWidth: 80,
        singleQuote: true,
        semi: true,
      },
    ],
  },
};
