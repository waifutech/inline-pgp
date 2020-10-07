/* eslint-disable import/no-commonjs */

module.exports = {
    'parser': '@babel/eslint-parser',
    'env': {
        'browser': true,
        'es2021': true,
    },
    'extends': [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
    ],
    'parserOptions': {
        'ecmaFeatures': {
            'jsx': true,
        },
        'ecmaVersion': 12,
        'sourceType': 'module',
    },
    'plugins': [
        'react', 'import',
    ],
    'rules': {
        'no-cond-assign': 'off',
        'no-extra-boolean-cast': 'off',
        'no-extra-semi': 'off',
        'no-useless-escape': 'warn',

        'no-unused-vars': ['error', { 'ignoreRestSiblings': true, 'args': 'after-used', 'argsIgnorePattern': '^_' }],
        'no-multi-spaces': 'error',
        'no-tabs': 'error',
        'no-unused-expressions': ['error', { 'allowShortCircuit': true, 'allowTernary': true }],

        'indent': ['error', 4],
        'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
        'eol-last': ['error', 'always'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'never', { 'beforeStatementContinuationChars': 'always' }],
        'comma-spacing': ['error', { 'before': false, 'after': true }],
        'comma-style': ['error', 'last'],
        'comma-dangle': ['error', 'always-multiline'],
        'space-in-parens': ['error', 'never'],
        'space-before-function-paren': ['error', { 'anonymous': 'never', 'named': 'never', 'asyncArrow': 'always' }],
        'arrow-spacing': ['error', { 'before': true, 'after': true }],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
        'block-spacing': ['error', 'always'],
        'func-call-spacing': ['error', 'never'],
        'keyword-spacing': ['error', { 'before': true, 'after': true }],
        'function-call-argument-newline': ['error', 'consistent'],
        'array-element-newline': ['error', 'consistent'],
        'padding-line-between-statements': [
            'error',
            { 'blankLine': 'always', 'prev': '*', 'next': 'return' },
            { 'blankLine': 'always', 'prev': ['const', 'let', 'var'], 'next': '*' },
            { 'blankLine': 'any', 'prev': ['const', 'let', 'var'], 'next': ['const', 'let', 'var'] },
        ],
        'padded-blocks': ['error', 'never'],
        'dot-location': ['error', 'property'],
        'object-shorthand': ['error', 'always'],

        'react/prop-types': 0,
        'react/no-find-dom-node': 'warn',
        'react/jsx-indent': ['error', 4, { 'checkAttributes': true, 'indentLogicalExpressions': true }],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-curly-newline': ['error', { 'multiline': 'consistent', 'singleline': 'consistent' }],

        'import/no-commonjs': 'error',
        // 'import/no-relative-parent-imports': 'error',
        'import/no-useless-path-segments': 'error',
        'import/order': [
            'error',
            {
                'groups': [
                    ['builtin', 'external'],
                    ['internal'],
                    ['sibling', 'index'],
                    ['parent'],
                ],
                'newlines-between': 'always',
                'alphabetize': { 'order': 'asc', 'caseInsensitive': true },
            },
        ],

    },
    'globals': {
        chrome: 'readonly',
        require: 'readonly',
        module: 'writable',
        __dirname: 'readonly',
        process: 'readonly',
    },
}
