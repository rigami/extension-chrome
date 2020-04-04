const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, "src"),
    entry: './index.js',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'build'),
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: '/build',
        hot: true,
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "./index.html",
            filename: "index.html"
        }),
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
            'i18n': '/i18n',
            'dict': '/dict',
            'config': '/config',
            'themes': '/themes',
        }
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        },
    },
};