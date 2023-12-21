import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import { Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const rootPath = path.resolve(__dirname, '..');

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFields: ['main', 'module', 'browser'],
    alias: {
      main: path.join(__dirname, '../src/main'),
      renderer: path.join(__dirname, '../src/renderer'),
    },
  },
  entry: path.resolve(rootPath, 'src/renderer', 'index.tsx'),
  target: 'electron-renderer',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        include: /src/,
        use: {
          loader: 'ts-loader',
        },
      },
      {
        test: /\.s?css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
        exclude: /\.module\.s?(c|a)ss$/,
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  devServer: {
    static: {
      directory: path.resolve(rootPath, 'dist/renderer'),
      publicPath: '/',
    },
    port: 4000,
    historyApiFallback: true,
    compress: true,
    // overlay: {
    //   runtimeErrors: (error) => {
    //     if (error.message === 'ResizeObserver loop limit exceeded') {
    //       return false;
    //     }

    //     return true;
    //   },
    // },
  },
  output: {
    path: path.resolve(rootPath, 'dist/renderer'),
    filename: 'js/[name].js',
  },
  plugins: [
    new HtmlWebpackPlugin({ template: path.resolve(rootPath, 'index.html') }),
    new MonacoWebpackPlugin({
      languages: ['json', 'javascript', 'python'], //configure your languages here
      features: ['coreCommands', 'find'],
    }), // Place it here
  ],
};

export default config;
