const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

// const mode = process.env.NODE_ENV

module.exports = {
  // mode,
  entry: {
    content: './src/content/index.js',
    // popup: './src/popup/index.js',
    background: './src/background/index.js'
  },
  output: {
    filename: '[name]/[name].js',
    path: path.resolve('dist'),
    publicPath: './'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 9000
  },
  resolve: {
    modules: [
      'node_modules'
    ],
    extensions: ['.vue', '.js', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              insert: 'html',
            }
          },
          'css-loader'
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'url-loader'
      }
    ]
  },
  plugins: [
    // new HTMLWebpackPlugin({
    //   template: './src/popup/index.html',
    //   filename: 'popup.html',
    //   chunks: ['popup']
    // }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'manifest.json',
          to: '.'
        },
        {
          from: 'src/assets',
          to: 'assets'
        }
      ]
    }),
    new VueLoaderPlugin()
  ],
  // optimization: {
  //   usedExports: true,
  //   splitChunks: {
  //     chunks: 'all'
  //   }
  // }
}
