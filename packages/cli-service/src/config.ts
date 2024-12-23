import InjectChunkWebpackPlugin from '@wx-code-pro/inject-chunk-webpack-plugin'
import AppJsonWebpackPlugin from '@wx-code-pro/app-json-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import type { Configuration } from 'webpack'
import TerserWebpackPlugin from 'terser-webpack-plugin';
import WebpackBar from 'webpackbar'

import { resolve } from './utils'
export interface Config {
  /** 开发路径默认 src */
  entryPath?: string
  /** 入口文件 */
  source?: string[]
  /** 第一页 */
  pageIndex?: string
  /** webpack 配置 */
  webpack?: Configuration
}

export function getDefaultConfig(
  options?: Pick<Config, 'entryPath' | 'source' | 'pageIndex'> & { isDev?: boolean },
): Required<Config> {
  const { entryPath, source, pageIndex, isDev } = Object.assign(
    {
      isDev: false,
      pageIndex: '',
      entryPath: './src',
      source: ['app.(js|ts)', 'pages/**/*.(js|ts)', 'components/**/*.(js|ts)'],
    },
    options,
  )

  // 模式
  const mode = isDev ? 'development' : 'production'

  // 插件
  const plugins = [
    //sass css 后缀名转成wxss
    new MiniCssExtractPlugin({
      filename: '[name].wxss',
    }),
    new InjectChunkWebpackPlugin(),
    new AppJsonWebpackPlugin({
      pageIndex,
    }),
    new WebpackBar(),
  ]
  // if (isDev) {
  //   plugins.push(new HMRWebpackPlugin())
  // }

  // 优化
  const optimization: Configuration['optimization'] = {
    // chunks https://webpack.docschina.org/guides/code-splitting/#splitchunksplugin
    // a引用c b引用c 默认会把c 打到 a, b里 chunks:all 会把c座位一个单独的bundle 分割
    // 小程序 不会同时引入 a b web页面注意要加入 runtimeChunk: 'single', 否则 c只有一份 如果c有实例化的东西 a b操作的会为1份
    // minchunks:简单来讲，假如 minChunks 设置为 n，那么某个 module 想要被拆分出去，那么它的共享次数（或者说并行请求次数必须 >= n）
    // minSize与maxSize minSize限制拆分包的最小值(达到这个值，就拆出新包)
    // maxSize限制每个拆分出来的包的最大文件体积(超过这个大小，再做包拆分

    splitChunks: {
      chunks: 'all',
      minChunks: 2,
      minSize: 0,
      cacheGroups: {
        main: {
          name: 'bundle',
          minChunks: 2,
          chunks: 'all',
        },
      },
    },
  }
  // 生产环境
  if (!isDev) {
    //告知 webpack 使用 TerserPlugin 或其它在 optimization.minimizer定义的插件压缩 bundle。
    //允许你通过提供一个或多个定制过的 TerserPlugin 实例，覆盖默认压缩工具(minimizer)。
    optimization.minimize = true   //是否压缩
    optimization.minimizer = [
      new TerserWebpackPlugin({
        // 不生成 license 文件
        extractComments: false,
        terserOptions: {
          format: {
            comments: false, // 删除注释
          },
        },
      }),
    ]
  }

  return {
    pageIndex,

    entryPath,

    source,

    webpack: {
      mode,

      devtool: false,

      output: {
        filename: '[name].js',
        path: resolve('dist'),
        publicPath: '/',
        clean: true,
      },

      resolve: {
        alias: {
          '@': resolve('src'),
        },
        extensions: ['.js', '.ts'],
      },

      module: {
        rules: [
          {
            oneOf: [
              //如果由于某种原因你需要将 CSS 提取为一个文件（即不要将 CSS 存储在 JS 模块中）
              //https://github.com/webpack-contrib/css-loader#recommend
              {
                test: /\.(css|wxss)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
              },
              {
                test: /\.s(a|c)ss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
              },
              // {
              //   test: /\.(wxml|html)$/,
              //   loader: '@codelet/wxml-loader',
              //   options: {
              //     entryPath,
              //   },
              // },
              {
                test: /\.wxs$/,
                loader: '@codelet/copy-loader',
                options: {
                  entryPath,
                },
              },
              //json拷贝
              {
                test: /\.json$/,
                //type 设置为 javascript/auto 以绕过 webpack 内置的 json 导入
                type: 'javascript/auto',
                loader: '@wx-code-pro/copy-loader',
                options: {
                  entryPath,
                },
              },
              {
                test: /\.(png|jpe?g|gif|svg)$/,
                //发送一个单独的文件并导出 URL。之前通过使用 file-loader 实现。
                type: 'asset/resource',
                generator: {
                  filename: 'assets/images/[name][ext]',
                },
              },
              // https://babeljs.io/docs/options
              // 语法转换 和 垫片（Polyfill）详见文档
              // 详见readme
              // options https://webpack.docschina.org/loaders/babel-loader/ 或 babel文档
              {
                test: /\.(ts|js)$/,
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true, // 开启 babel 缓存
                  cacheCompression: false, // 关闭缓存文件压缩
                },
              },
            ],
          },
        ],
      },

      plugins,

      optimization,
    },
  }
}
