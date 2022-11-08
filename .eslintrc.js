module.exports = {
    'extends': ['rigami'],
    'parser': '@babel/eslint-parser',
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
    'globals': {
        'PRODUCTION_MODE': true,
        'PRODUCTION_ENV': true,
        'COLLECT_LOGS': true,
        'BUILD': true,
        'TARGET:': true,
    },
    'rules': {
        'prefer-arrow-callback': 'off',
        'no-duplicate-case': 'off',
        'no-fallthrough': 'off',
        'indent': ['error', 4, { 'SwitchCase': 1 }],
    },
    'settings': {
        'import/resolver': {
            alias: {
                map: [['@', `${__dirname}/src/`]],
                extensions: ['.js', '.jsx', '.json'],
            },
        },
    },
};
