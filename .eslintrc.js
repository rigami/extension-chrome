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
