const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
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
				exclude: /node_modules/,
				use: [
					{ loader: 'react-svg-loader' },
				],
			},
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: { loader: 'babel-loader' },
			},
			{
				test: path.resolve(__dirname, 'node_modules/library/polyfill.js'),
				use: 'null-loader',
			},
		],
	},
	resolve: {
		extensions: ['.jsx', '.js', '.json', '.less', 'svg'],
		alias: paths(),
	},
	optimization: { splitChunks: { chunks: 'all' } },
});
