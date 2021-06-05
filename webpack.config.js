const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const GenerateJsonPlugin = require('generate-json-from-js-webpack-plugin');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const paths = require('./alias.config.js');
const packageFile = require('./package.json');

module.exports = () => {
    const build = process.env.BUILD || 'full';

    let entry = {
        app: './templates/app/index.jsx',
        // server: './templates/server/index.js',
    };
    const plugins = [
        new CleanWebpackPlugin({
            cleanAfterEveryBuildPatterns: [
                '*.bundle.js',
                '*.hot-update.js',
                '!resource/*',
                '!fastInitializationApp.js',
                '!fastInitializationPopup.js',
                '!index.html',
                '!popup.html',
                '!server.html',
            ],
        }),
        new HtmlWebpackPlugin({
            inject: true,
            chunks: ['app'],
            template: './templates/app/index.html',
            filename: 'index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './config/manifestLocales/',
                    to: './_locales/',
                },
                {
                    from: '../public/',
                    to: './resource/',
                },
                {
                    from: './i18n/',
                    to: './resource/i18n/',
                },
                {
                    from: './templates/app/fastInitialization.js',
                    to: './fastInitializationApp.js',
                },
                {
                    from: './templates/popup/fastInitialization.js',
                    to: './fastInitializationPopup.js',
                },
            ],
        }),
        new WorkboxPlugin.InjectManifest({
            swSrc: './templates/server/index.js',
            swDest: 'server.js',
        }),
        new GenerateJsonPlugin({
            path: './config/manifest.js',
            filename: './manifest.json',
        }),
        new webpack.DefinePlugin({
            PRODUCTION_MODE: JSON.stringify(process.env.NODE_ENV === 'production'),
            PRODUCTION_ENV: JSON.stringify(Boolean(process.env.PRODUCTION_ENV)),
            COLLECT_LOGS: process.env.COLLECT_LOGS,
            BUILD: JSON.stringify(build),
        }),
    ];

    if (build === 'full') {
        entry = {
            ...entry,
            popup: './templates/popup/index.jsx',
        };
        plugins.push(new HtmlWebpackPlugin({
            inject: true,
            chunks: ['popup'],
            template: './templates/popup/index.html',
            filename: 'popup.html',
        }));
    }

    if (process.env.ANALYZE === 'true') {
        plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportTitle: () => `rigami-${build}`,
        }));
    }

    if (process.env.COLLECT_LOGS === 'true') {
        plugins.push(new SentryWebpackPlugin({
            authToken: 'e553e6efe10f4122bbcc0ba70067adb88c5e2042ca4842fca1977360c9b80dfa',
            org: 'rigami',
            project: 'extension-chrome',
            release: `extension-chrome@${packageFile.version}`,
            include: '.',
            ignore: ['node_modules', 'webpack.config.js'],
        }));
    }

    return {
        context: path.resolve(__dirname, 'src'),
        entry,
        mode: process.env.NODE_ENV || 'development',
        output: {
            filename: (pathData) => (pathData.chunk.name === 'server' ? '[name].js' : '[name].[contenthash].bundle.js'),
            path: path.resolve(__dirname, 'build'),
        },
        devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'cheap-source-map',
        devServer: {
            contentBase: path.resolve(__dirname, 'public'),
            hot: true,
            open: false,
            overlay: true,
            writeToDisk: true,
            disableHostCheck: true,
            port: 3000,
        },
        plugins,
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
                    sideEffects: true,
                },
                {
                    test: /\.(woff(2)?|ttf|eot|png|jpg|gif)(\?v=\d+\.\d+\.\d+)?$/,
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
        },
        optimization: {
            usedExports: true,
            splitChunks: { chunks: 'all' },
        },
    };
};
