const paths = require('./alias.config.js');

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
        /*["@babel/plugin-transform-react-jsx", {
            "pragma": "h",
            "pragmaFrag": "Fragment"
        }],*/
        ["module-resolver", {
            "root": ["./src"],
            "alias": paths(__dirname+"/src/"),
        }]
    ]
};
