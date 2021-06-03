const paths = require('./alias.config.js');

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
