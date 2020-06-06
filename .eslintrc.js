const paths = require('./alias.config.js');

module.exports = {
    'env': {
        'browser': true,
        'node': true,
        'webextensions': true,
        'es6': true,
    },
    'extends': [
        'eslint:recommended',
        'airbnb',
        'airbnb/hooks',
        'plugin:sonarjs/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:jsx-a11y/recommended',
        'plugin:json/recommended',
        'plugin:react/recommended',
    ],
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly',
        'chrome': true,
        'webkitRequestFileSystem': true,
        'PERSISTENT': true,
        'addEventListener': true,
    },
    'parser': 'babel-eslint',
    'parserOptions': {
        'ecmaFeatures': {
            'legacyDecorators': true,
            'impliedStrict': true,
            'jsx': true,
            'modules': true,
        },
        'ecmaVersion': 2020,
        'sourceType': 'module',
    },
    'plugins': [
        'react',
        'promise',
        'no-use-extend-native',
        'jsx-a11y',
    ],
    'rules': {
        'indent': ['warn', 4],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['warn', 'single'],
        'semi': ['error', 'always'],
        'no-else-return': 'off',
        'quote-props': 'off',
        'sonarjs/no-duplicate-string': ['error', 3],
        'no-tabs': 'off',
        'no-console': 'off',
        'no-underscore-dangle': 'off',
        'no-bitwise': 'off',
        'lines-between-class-members': ['error', 'always', { 'exceptAfterSingleLine': true }],
        'class-methods-use-this': 'off',
        'consistent-return': ['error', { 'treatUndefinedAsUnspecified': true }],
        'max-len': ['warn', 120],
        'no-param-reassign': ['error', { 'props': false }],
        'max-classes-per-file': ['warn', 9],
        'no-restricted-syntax': 'off',
        'no-continue': 'off',
        'react/jsx-indent': [
            'warn',
            4,
            {
                indentLogicalExpressions: true,
                checkAttributes: true,
            },
        ],
        'react/jsx-indent-props': ['warn', 4],
        'react/jsx-fragments': ['warn', 'element'],
        'react/jsx-props-no-spreading': 'off',
        'no-unused-vars': ['warn'],
        'react/prop-types': 'off',
        'no-restricted-globals': 'off',
        'object-curly-spacing': ['error', 'always'],
        'object-curly-newline': [
            'warn',
            {
                'ObjectExpression': {
                    'multiline': true,
                    'minProperties': 2,
                },
                'ObjectPattern': {
                    'multiline': true,
                    'minProperties': 5,
                },
                'ImportDeclaration': {
                    'multiline': true,
                    'minProperties': 4,
                },
                'ExportDeclaration': {
                    'multiline': true,
                    'minProperties': 4,
                },
            },
        ],
        'object-property-newline': ['warn', { 'allowAllPropertiesOnSameLine': false }],
        'no-duplicate-imports': 'error',
        'react-hooks/exhaustive-deps': 'off',
        'react/jsx-max-props-per-line': [
            'warn',
            {
                'maximum': 3,
                'when': 'always',
            },
        ],
        'array-element-newline': [
            'warn',
            {
                'multiline': true,
                'minItems': 4,
            },
        ],
        'array-bracket-newline': ['warn', { 'multiline': true }],
        'arrow-body-style': ['error', 'as-needed'],
        'no-empty-pattern': 'off',
    },
    'overrides': [
        {
            'files': ['*/i18n/*.js', '*/config/*'],
            'rules': {
                'sonarjs/no-duplicate-string': 'off',
                'max-len': 'off',
            },
        },
        {
            'files': ['*.jsx'],
            'rules': { 'sonarjs/cognitive-complexity': ['error', 85] },
        },
    ],
    'settings': {
        'import/resolver': {
            alias: {
                map: (() => {
                    const p = paths(`${__dirname}/src/`);

                    return Object.keys(p)
                        .map((key) => [key, p[key]]);
                })(),
                extensions: ['.js', '.jsx', '.json'],
            },
        },
    },
};
