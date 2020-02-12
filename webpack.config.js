const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, "src"),
    entry: './index.js',
    output: {
        publicPath: '/',
        filename: 'bundle.js',
        path: '/build',
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
            'ui-pages': '/ui-pages'
        }
    }
};