import path from 'path';
import fs from 'fs'
//https://github.com/mrmlnc/fast-glob
// 支持glob表达式 遍历文件系统
import fg from 'fast-glob'
import type { Configuration } from 'webpack'
import { getDefaultConfig, type Config } from './config';
import merge from 'webpack-merge';

//找到命令行 是否含有这项
export function getOptionValue(argv: string[], options: string){
  return argv.find( i => i === options)
}

//脚本运行目录
export const cmd = process.cwd()

export const resolve = (...args: string[]) => path.resolve(cmd, ...args)

//解析cli参数
export function parseArgv(argv: string[]){
  const isWatch = argv.includes('--watch')
  const isDev = argv.includes('dev')
  const pageIndex = getOptionValue(argv, '--pageIndex') || ''
  const configRelativePath = getOptionValue(argv, '--config') || 'codelet.config.js'
  const configPath = resolve(configRelativePath)
  return {
    configPath, //配置文件的相对路径
    isWatch, //是否监听
    pageIndex, //小程序首页
    isDev
  }
}

//多文件打包入口检索
export const parseDir = (entryPath: string, source: string[]) => {
  entryPath = resolve(entryPath)
  const filepaths = fg.sync(source.map((item) => resolve(entryPath, item)))
  const entry = filepaths.reduce<Record<string, { import: string; runtime: string }>>(
    (res, filepath) => {
      const relPath = path.relative(entryPath, filepath)
      const { dir, name } = path.parse(relPath)
      res[path.join(dir, name)] = {
        import: filepath,
        runtime: 'bundle',
      }
      return res
    },
    {},
  )

  return { entry }
}

export function getConfig(options: {
  configPath: string
  isWatch: boolean
  isDev: boolean
  pageIndex: string
}): Configuration {
  const { configPath, isWatch } = options
  let config: Required<Config>
  //同步地检查 配置文件 或目录是否存在
  if (fs.existsSync(configPath)){
    
    const cfg = require(configPath)

    //如果是配置文件为函数 先拿到默认值 调用项目函数把默认项传入 要求返回Configuration
    if (typeof cfg === 'function') {
      config = getDefaultConfig(options)
      config = cfg(config)
    }else {
      // 配置文件和命令行有pageIndex isDev 有先走命令行
      if (options.pageIndex) {
        cfg.pageIndex = options.pageIndex
      }
      if (options.isDev) {
        cfg.isDev = options.isDev
      }
      //先拿默认值
      config = getDefaultConfig(cfg)
      config = {
        ...config,
        ...cfg,
        ...merge(config.webpack ?? {}, cfg.webpack ?? {}),
      }
    }
  } else {
    //没有需要修改的webpack配置走默认
    config = getDefaultConfig(options)
  }

  const { entryPath, source, webpack } = config

  // entryPath默认src  source入口文件
  if (!webpack.entry) {
    //目的是生成对应的小程序文件 所以需要根据source检索出全部入口文件地址
    const { entry } = parseDir(entryPath, source)
    webpack.entry = entry
  }

  if (isWatch) {
    webpack.watch = true
  }

  return webpack

}