const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const paths = require('./alias.config.js');

module.exports = (env, args) => ({
    context: path.resolve(__dirname, 'src'),
    entry: {
        app: './index.js',
        popup: './popup.js',
        background: './background.js',
    },
    mode: process.env.NODE_ENV || 'development',
    output: {
        filename: '[name].[contenthash].bundle.js',
        path: path.resolve(__dirname, 'build'),
    },
    devtool: args.mode === 'production' ? false : 'eval-source-map',
    devServer: {
        contentBase: path.resolve(__dirname, 'public'),
        hot: true,
        open: false,
        overlay: true,
        writeToDisk: true,
        disableHostCheck: true,
        port: 3000,
    },
    plugins: [
        process.env.ANALYZE === 'true' ? new BundleAnalyzerPlugin() : () => {},
        new CleanWebpackPlugin({
            cleanAfterEveryBuildPatterns: [
                '*.bundle.js',
                '*.hot-update.js',
                '!resource/*',
                '!manifest.json',
                '!fastInitialization.js',
                '!index.html',
                '!popup.html',
                '!background.html',
            ],
        }),
        new HtmlWebpackPlugin({
            inject: true,
            chunks: ['app'],
            template: './index.html',
            filename: 'index.html',
        }),
        new HtmlWebpackPlugin({
            inject: true,
            chunks: ['popup'],
            template: './popup.html',
            filename: 'popup.html',
        }),
        new HtmlWebpackPlugin({
            inject: true,
            chunks: ['background'],
            template: './background.html',
            filename: 'background.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './config/manifest.json',
                    to: './manifest.json',
                },
                {
                    from: './config/manifestLocales/',
                    to: './_locales/'
                },
                {
                    from: path.resolve(__dirname, 'public/'),
                    to: './resource/',
                },
                {
                    from: './fastInitialization.js',
                    to: './fastInitialization.js',
                },
            ],
        }),
        new webpack.DefinePlugin({ PRODUCTION_MODE: JSON.stringify(process.env.NODE_ENV === 'production') }),
    ],
    module: {
        rules: [
            {
                test: /\.m?js/,
                resolve: { fullySpecified: false },
            },
            {
                test: /\.svg$/,
                loader: require.resolve('react-svg-loader'),
                options: { svgo: { plugins: [{ removeViewBox: false }] } },
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: require.resolve('babel-loader'),
            },
            {
                test: /\.css$/i,
                use: [{ loader: require.resolve('style-loader') }, { loader: require.resolve('css-loader') }],
            },
            {
                test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: require.resolve('file-loader'),
                        options: {
                            name: '[name].[ext]',
                            outputPath: './resource/',
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: [
            '.jsx',
            '.js',
            '.json',
            '.less',
            '.svg',
        ],
        alias: paths(),
        plugins: [PnpWebpackPlugin],
    },
    resolveLoader: { plugins: [PnpWebpackPlugin.moduleLoader(module)] },
    optimization: { splitChunks: { chunks: 'all' } },
});
