const path = require('path');

module.exports = {
    "presets": [
        /*["@babel/preset-env", {
            "targets": "last 2 versions",
        }],*/
        "@babel/preset-react",
    ],
    "plugins": [
        "@babel/plugin-proposal-class-properties",
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
                'i18n': path.resolve(__dirname, 'src/i18n'),
                'dict': path.resolve(__dirname, 'src/dict'),
                'config': path.resolve(__dirname, 'src/config'),
            }
        }]
    ]
};