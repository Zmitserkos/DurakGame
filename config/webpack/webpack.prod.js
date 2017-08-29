
const webpack = require('webpack');
const path = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const folderName = 'dist';

module.exports = function(env) {
  return {
    entry: {
      'polyfills': './client/polyfills.ts',
      'vendor': './client/vendor.ts',
      'app': './client/index.ts'
    },
    output: {
      path: path.resolve('public/' + folderName + '/client/'),
      publicPath: '/',
      filename: '[name].js'
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    node: {
      fs: 'empty'
    },
    module: {
      loaders: [
        {
          test: /\.ts$/,
          loaders: [
            {
              loader: 'awesome-typescript-loader',
              options: {
                configFileName: path.resolve('tsconfig.json')
              }
            },
            'angular2-template-loader',
            'angular-router-loader'
          ]
        },
        {
          test: /\.html$/,
          loader: 'html-loader'
        },
        {
          test: /\.css$/,
          loader: 'raw-loader'
        },
        {
          test: /\.css$/,
          include: path.resolve('client/durak-game/styles/css/app'),
          use: ExtractTextPlugin.extract({
  				  fallback: "style-loader",
  				  use: "css-loader"
          })
        }
      ]
    },

    plugins: [
      new webpack.DefinePlugin({
        NODE_ENV: JSON.stringify(env)
      }),

      /*new webpack.ContextReplacementPlugin(
        /angular(\\|\/)core(\\|\/)@angular/,
        path.resolve('./client'),
        {}
      ),*/

      new webpack.optimize.CommonsChunkPlugin({
        names: ['app', 'vendor', 'polyfills'],
        filename: 'js/[name].js'
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '../../client/index.html')
      }),
      new webpack.NoEmitOnErrorsPlugin(),
      new ExtractTextPlugin('css/[name].css'),
      new webpack.optimize.UglifyJsPlugin({
        mangle: {
          keep_fnames: true
        }
      }),
      new webpack.LoaderOptionsPlugin({
        htmlLoader: {
          minimize: true
        }
      })
    ]
  };
};
