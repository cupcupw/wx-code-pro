import path from 'path'
import type { LoaderContext } from 'webpack'

import schema from './schema.json'
import type { CopyLoaderOptions } from './types'

export default function loader(this: LoaderContext<CopyLoaderOptions>, content: string) {
  //获取loader配置项
  const { entryPath = 'src' } = this.getOptions(schema as any)

  // this.rootContext 脚本运行目录
  //入口路径
  //resourcePath 文件路径
  //获取 相对于入口路径的 相对路径
  //https://webpack.docschina.org/api/loaders/#thisemitfile
  const outputPath = this.utils.contextify(
    path.resolve(this.rootContext, entryPath),
    this.resourcePath,
  )
  //产生一个文件
  this.emitFile(outputPath, content)
  return ''
}
