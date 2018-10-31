const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: ['@babel/polyfill', './src/index.js'],
  devtool: 'eval-source-map',
  mode: 'development',
  output: {
    library: 'EBAWidget',
    libraryTarget: 'umd',
    filename: 'App.js',
    path: path.resolve(__dirname, 'app/widgets/MyReactWidget'),
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
  plugins: [new Dotenv()],
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
