const path = require('path');

module.exports = {
    "presets": [
        ["@babel/preset-env", {
            "targets": {
                "chrome": 75,
                "esmodules": true,
            },
            "bugfixes": true,
            "loose": true,
            "shippedProposals": true
        }],
        "@babel/preset-react",
    ],
    "plugins": [
        ["@babel/plugin-syntax-throw-expressions"],
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }],
        ["@babel/plugin-transform-react-jsx", {
            "pragma": "h",
            "pragmaFrag": "Fragment"
        }],
        ["module-resolver", {
            "root": ["."],
            "alias": {
                "react": "preact-compat",
                "react-dom": "preact-compat",
                'ui': path.resolve(__dirname, 'src/ui'),
                'ui-components': path.resolve(__dirname, 'src/ui-components'),
                'i18n': path.resolve(__dirname, 'src/i18n'),
                'dict': path.resolve(__dirname, 'src/dict'),
                'config': path.resolve(__dirname, 'src/config'),
                'themes': path.resolve(__dirname, 'src/themes'),
                'stores': path.resolve(__dirname, 'src/stores'),
                'utils': path.resolve(__dirname, 'src/utils'),
                'hoc': path.resolve(__dirname, 'src/hoc'),
                'images': path.resolve(__dirname, 'src/images'),
            }
        }]
    ]
};