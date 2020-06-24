const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const paths = require('./alias.config.js');

module.exports = (env, args) => ({
    context: path.resolve(__dirname, 'src'),
    entry: { app: './index.js' },
    mode: args.mode || 'development',
    output: {
        filename: '[name].[hash].bundle.js',
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
        args.mode === 'production' ? new BundleAnalyzerPlugin() : () => {},
        new CleanWebpackPlugin({
            cleanAfterEveryBuildPatterns: [
                '*.bundle.js',
                '*.hot-update.js',
                '!resource/*',
                '!manifest.json',
                '!fastInitialization.js',
                '!index.html',
            ],
        }),
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: 'index.html',
        }),
        new CopyWebpackPlugin([
            {
                from: './config/manifest.json',
                to: './manifest.json',
                transform(content) {
                    return content;
                },
            },
            {
                from: path.resolve(__dirname, 'public/'),
                to: './resource/',
                transform(content) {
                    return content;
                },
            },
            {
                from: './fastInitialization.js',
                to: './fastInitialization.js',
                transform(content) {
                    return content;
                },
            },
        ]),
    ],
    module: {
        rules: [
            {
                test: /\.svg$/,
                loader: require.resolve('react-svg-loader'),
            },
            {
                test: /\.(js|jsx)$/,
                loader: require.resolve('babel-loader'),
            },
            {
                test: /\.css$/i,
                loader: [require.resolve('style-loader'), require.resolve('css-loader')],
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
