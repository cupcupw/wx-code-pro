import path from 'path'
import { Chunk, Compilation, Compiler, sources } from 'webpack'

const NAME = 'InjectChunkWebpackPlugin'
export default class InjectChunkWebpackPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(NAME, (compilation) => {
      // asset 处理
      // stage具体参考 https://webpack.docschina.org/api/compilation-hooks/#list-of-asset-processing-stages
      compilation.hooks.processAssets.tap(
        {
          name: NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => {
          //chunkLoadingGlobal webpack 用于加载 chunk 的全局变量。
          //globalObject
          //globalObject=> self
          //chunkLoadingGlobal => webpackChunk_wx_code_pro_playground
          const { globalObject, chunkLoadingGlobal } = compilation.outputOptions
          const chunkLoadingGlobalStr = JSON.stringify(chunkLoadingGlobal)

          const processedChunk = new Set()

          function getTargetFile(file: string) {
            const queryStringIdx = file.indexOf('?')
            if (queryStringIdx >= 0) {
              file = file.substr(0, queryStringIdx)
            }
            return file
          }

          function toPosix(path: string) {
            return path.replace(/\\/g, '/')
          }

          // 获取关联的js文件
          function getChunkFile(chunk: Chunk) {
            // [ 'bundle.js' ] 【 'app.wxss', 'app.js' 】
            console.log(' chunk.files=>', chunk.files)
            return Array.from(chunk.files).find((item) => ['.js'].includes(path.extname(item)))
          }

          function processChunk(chunk: Chunk, isRuntime: boolean, relativeChunks: Chunk[]) {
            // 获取关联的js文件
            // [ 'bundle.js' ] 【 'app.wxss', 'app.js' 】 取到js
            // chunkFile=> bundle.js chunkFile=> app.js
            const chunkFile = getChunkFile(chunk)
            if (!chunkFile || processedChunk.has(chunk)) {
              return
            }
            //获取CachedSource 文件内容
            const originalSource = compilation.assets[chunkFile]

            //new sources.ConcatSource 是在 webpack 打包工具中使用的代码，用于连接和拼接多个源（例如：文件）以创建一个单一的源。
            const source = new sources.ConcatSource()
            source.add(`\nvar ${globalObject} = {};\n`)

            relativeChunks.forEach((relativeChunk, index) => {
              // 获取路径 bundle.js
              const relativeChunkFile = relativeChunk.files.values().next().value
              console.log(' relativeChunkFile=>', relativeChunkFile)
              if (!relativeChunkFile) return
              // 获取关联文件的
              const chunkPath = getTargetFile(chunkFile)
              //获取关联文件的路径
              let relativePath = getTargetFile(relativeChunkFile)
              relativePath = path.relative(path.dirname(chunkPath), relativePath)
              relativePath = toPosix(relativePath)
              if (index === 0) {
                source.add(
                  `${globalObject}[${chunkLoadingGlobalStr}] = require("${relativePath}");\n`,
                )
              } else {
                source.add(`require("${relativePath}");\n`)
              }
            })

            if (isRuntime) {
              source.add(originalSource)
              source.add(`\nmodule.exports = ${globalObject}[${chunkLoadingGlobalStr}];\n`)
            } else {
              source.add(originalSource)
            }

            compilation.assets[chunkFile] = source
            processedChunk.add(chunk)
          }

          // chunkGroups是chunk集合
          // 一个chunk是由关联的模块组成的 比如app.ts 关联的 app.scss app.json 入口文件关联的模块成为一个chunk,还有babel的垫片
          compilation.chunkGroups.forEach((chunkGroup) => {
            //chunkGroup参考chunk-group.text文件
            if (!chunkGroup.isInitial()) {
              return
            }

            let runtimeChunk: Chunk | undefined
            let entryChunk: Chunk | undefined
            const middleChunks: Chunk[] = []
            const chunksLength = chunkGroup.chunks.length

            chunkGroup.chunks.forEach((chunk, index) => {
              if (index === 0) {
                runtimeChunk = chunk
              } else if (index === chunksLength - 1) {
                entryChunk = chunk
              } else {
                middleChunks.push(chunk)
              }
            })

            if (runtimeChunk) {
              processChunk(runtimeChunk, true, [])
              if (middleChunks.length) {
                middleChunks.forEach((middleChunk) => {
                  processChunk(middleChunk, false, [runtimeChunk!])
                })
              }
              if (entryChunk) {
                middleChunks.unshift(runtimeChunk)
                processChunk(entryChunk, false, middleChunks)
              }
            }
          })
        },
      )
    })
  }
}
