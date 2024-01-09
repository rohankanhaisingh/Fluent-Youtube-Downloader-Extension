const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const TEMPLATES_FOLDER = path.join(__dirname, "public", "templates");
const ENTRY_FOLDER = path.join(__dirname, "public", "src");
const DIST_FOLDER = path.join(__dirname, "public", "dist");

module.exports = {
	mode: "production",
	entry: path.join(ENTRY_FOLDER, "app.ts"),
	output: {
		filename: 'bundle.[contenthash].js',
		path: DIST_FOLDER,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.join(TEMPLATES_FOLDER, "index.temp.html"),
			filename: path.join(__dirname, "public", "index.html"),
			inject: "body",
			hash: true
		}),
		new MiniCssExtractPlugin({
			filename: "style.[contenthash].css",
		}),
	],
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: 'ts-loader',
			},
			{
				test: /\.scss$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							publicPath: '',
						},
					},
					'css-loader',
					'sass-loader',
				],
			},
		],
	},
	devServer: {
		static: {
			directory: path.join(__dirname, "public"),
		},
		compress: true,
		port: 4000,
	},
};