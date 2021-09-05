const path = require('path');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const GenerateJsonPlugin = require('generate-json-from-js-webpack-plugin');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const packageFile = require('./package.json');

const generateBaseConfig = () => ({
    context: path.resolve(__dirname, 'src'),
    mode: process.env.NODE_ENV || 'development',
    devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'cheap-source-map',
    watch: process.env.NODE_ENV === 'development',
    watchOptions: { ignored: /node_modules/ },
    plugins: [
        /* new CleanPlugin({
            cleanBeforeEveryBuildPatterns: [
                '*.bundle.js',
                '*.hot-update.js',
                '!resource/*',
                '!fastInitializationApp.js',
                '!fastInitializationPopup.js',
                '!index.html',
                '!popup.html',
                '!server.html',
            ],
        }), */
        new webpack.DefinePlugin({
            PRODUCTION_MODE: JSON.stringify(process.env.NODE_ENV === 'production'),
            PRODUCTION_ENV: JSON.stringify(Boolean(process.env.PRODUCTION_ENV)),
            COLLECT_LOGS: process.env.COLLECT_LOGS,
            BUILD: JSON.stringify(process.env.BUILD || 'full'),
        }),
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
        alias: { '@': './' },
    },
    optimization: {
        usedExports: true,
        splitChunks: { chunks: 'all' },
    },
});

const serverConfig = () => {
    const build = process.env.BUILD || 'full';

    const entry = { server: './templates/server' };

    const plugins = [new webpack.DefinePlugin({ TARGET: JSON.stringify('server') })];

    if (process.env.ANALYZE === 'true') {
        plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportTitle: () => `rigami-server-${build}`,
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

    const baseConfig = generateBaseConfig();

    return {
        target: 'webworker',
        ...baseConfig,
        plugins: [...baseConfig.plugins, ...plugins],
        entry,
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'build'),
        },
        optimization: {
            usedExports: true,
            splitChunks: false,
        },
    };
};

const clientConfig = () => {
    const build = process.env.BUILD || 'full';

    let entry = { app: './templates/app' };

    const plugins = [
        new HtmlPlugin({
            inject: true,
            chunks: ['app'],
            template: './templates/app/index.html',
            filename: 'index.html',
        }),
        new CopyPlugin({
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
        new GenerateJsonPlugin({
            path: './config/manifest.js',
            filename: './manifest.json',
        }),
        new webpack.DefinePlugin({ TARGET: JSON.stringify('app') }),
    ];

    if (build === 'full') {
        entry = {
            ...entry,
            popup: './templates/popup',
        };
        plugins.push(new HtmlPlugin({
            inject: true,
            chunks: ['popup'],
            template: './templates/popup/index.html',
            filename: 'popup.html',
        }));
    }

    if (process.env.ANALYZE === 'true') {
        plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportTitle: () => `rigami-client-${build}`,
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

    const baseConfig = generateBaseConfig();

    return {
        target: 'web',
        ...baseConfig,
        plugins: [...baseConfig.plugins, ...plugins],
        entry,
        output: {
            filename: process.env.NODE_ENV === 'production' ? '[name].[contenthash].bundle.js' : '[name].js',
            path: path.resolve(__dirname, 'build'),
        },
    };
};

module.exports = [serverConfig, clientConfig];
