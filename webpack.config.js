const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, "src"),
    entry: './index.js',
    output: {
        chunkFilename: '[id].bundle.js',
        path: path.resolve(__dirname, 'build'),
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.resolve(__dirname, 'public'),
        hot: true,
        injectHot: (compilerConfig) => compilerConfig.name === 'only-include',
        open: false,
        overlay: true,
        writeToDisk: true,
        disableHostCheck: true,
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanAfterEveryBuildPatterns: ['*.bundle.js', '*.hot-update.js', '!resource/*', '!manifest.json'],
        }),
        new HtmlWebpackPlugin({
            template: "./index.html",
            filename: "index.html"
        }),
        new CopyWebpackPlugin([
            {
                from: "./manifest.json",
                to:   "./manifest.json",
                transform (content, path) {
                    return content;
                }
            },
            {
                from: path.resolve(__dirname, 'public/'),
                to:   "./resource/",
                transform (content, path) {
                    console.log(path)
                    return content;
                }
            }
        ]),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },
    resolve: {
        extensions: ['.jsx', '.js', '.json', '.less'],
        alias: {
            'react': 'preact/compat',
            'react-dom': 'preact/compat',
            'ui': '/ui',
            'ui-components': '/ui-components',
            'i18n': '/i18n',
            'dict': '/dict',
            'config': '/config',
            'themes': '/themes',
            'stores': '/stores',
            'utils': '/utils',
        }
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        },
    },
};