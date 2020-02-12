const path = require('path');

module.exports = {
    "presets": ["@babel/preset-env", "@babel/preset-react"],
    "plugins": [
        ["@babel/plugin-transform-react-jsx", {
            "pragma": "h",
            "pragmaFrag": "Fragment",
        }],
        ["module-resolver", {
            "root": ["."],
            "alias": {
                "react": "preact-compat",
                "react-dom": "preact-compat",
                'ui-pages': path.resolve(__dirname, 'src/ui-pages')
            }
        }]
    ]
}