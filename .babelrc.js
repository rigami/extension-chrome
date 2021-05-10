const paths = require('./alias.config.js');

module.exports = (api) => ({
    "presets": [
        ["@babel/preset-env", {
            "targets": {
                "chrome": 85,
                "esmodules": true,
            },
            "loose": true,
            "modules": false,
            "bugfixes": true,
            "shippedProposals": true
        }],
        "@babel/preset-react",
    ],
    "plugins": [
        ...(api.env() === 'development' ? [] : [['transform-remove-console']]),
        ["@babel/plugin-syntax-throw-expressions"],
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }],
        ["module-resolver", {
            "root": ["./src"],
            "alias": paths(__dirname+"/src/"),
        }],
        ['transform-imports',{
            '@material-ui/core': {
                'transform': '@material-ui/core/esm/${member}',
                'preventFullImport': true
            },
            '@material-ui/icons': {
                'transform': '@material-ui/icons/esm/${member}',
                'preventFullImport': true
            },
            'lodash': {
                'transform': 'lodash/${member}',
                'preventFullImport': true
            }
        }],
    ]
});
