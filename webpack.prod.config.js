const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = {
  entry: ['@babel/polyfill', './src/index.js'],
  devtool: 'source-map',
  mode: 'production',
  output: {
    library: 'EBAWidget',
    libraryTarget: 'umd',
    filename: 'App.js',
    path: path.resolve(__dirname, 'dist/MyReactWidget'),
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new LodashModuleReplacementPlugin(),
    new Dotenv(),
    new webpack.optimize.OccurrenceOrderPlugin(),
  ],
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    },
    reactDOM: {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
    },
  },
};
