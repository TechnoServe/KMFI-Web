const path = require('path');
const HtmlWebpack = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DotEnv = require('dotenv-webpack');
const StyleLintPlugin = require('stylelint-webpack-plugin');

const notProd = process.env.NODE_ENV != 'production';
const config = {
  mode: notProd ? 'development' : 'production',
  devtool: notProd ? 'source-map' : 'eval',
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: notProd ? '/' : path.resolve(__dirname, '../public'),
    publicPath: '/',
    filename: notProd ? 'js/[name].js' : 'js/[name].[hash].js',
    chunkFilename: notProd ? 'js/[name].js' : 'js/[name].[hash].js',
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules')],
    extensions: ['.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'eslint-loader',
            options: {
              failOnError: false,
              fix: true,
            },
          },
        ],
      },
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: notProd ? 'style-loader' : MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['autoprefixer'],
              },
            },
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: notProd ? 'style-loader' : MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
          },
        ],
      },
      {
        test: /\.(jpg|png|svg|gif|mp4)$/, // Added by Emmanuel
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1000,
              name: 'img/[hash].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(ttf|eot|woff(2)?)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1000,
              name: 'fonts/[hash].[ext]',
            },
          },
        ],
      },
    ],
  },
  devServer: {
    compress: false,
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    hot: false,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: `http://0.0.0.0:${process.env.API_PORT || 8000}`,
        changeOrigin: true,
        ignorePath: false,
        secure: false,
      },
      '/integration/companion': {
        target: `http://localhost:5020`,
        ws: true,
      },
    },
    watchOptions: {
      ignored: /node_modules/,
    },
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'all',
          name: 'vendor',
          enforce: true,
        },
      },
    },
    minimizer: notProd
      ? []
      : [
          new TerserPlugin({
            test: /\.js(\?.*)?$/i,
            parallel: true,
            terserOptions: {
              compress: {
                drop_console: true,
              },
              output: {
                comments: false,
                beautify: false,
              },
            },
          }),
        ],
  },
  plugins: [
    new DotEnv(),
    new HtmlWebpack({
      template: path.resolve(__dirname, 'src/index.html'),
      favicon: path.resolve(__dirname, 'src/assets/mfi-title-logo.png'),
      filename: 'index.html',
      minify: false,
    }),
    new MiniCssExtractPlugin({
      filename: notProd ? 'css/[name].css' : 'css/[name].[hash].css',
      chunkFilename: notProd ? 'css/[name].css' : 'css/[name].[hash].css',
    }),
    new StyleLintPlugin({
      lintDirtyModulesOnly: true,
      files: '**/*.s?(a|c)ss',
      fix: true,
    }),
  ],
};

module.exports = config;
