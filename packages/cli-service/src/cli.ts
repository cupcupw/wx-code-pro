import webpack, { Stats }  from "webpack"
import { getConfig, parseArgv } from "./utils"

// argv 第一个值是node路径第二个是当前cli运行目录 后边是参数 wxcodepro-cli a b c
const argv = process.argv

//拿到配置相对目录 打包pageindex 是否监听
const options = parseArgv(argv)

// 根据cli 和 主程序配置文件 生成webpack配置项
const config = getConfig(options)

const callback = (err?: Error | null, stats?: Stats) => {
  if (err) {
    throw err
  }
  if (stats) {
    console.log(
      stats.toString({
        chunks: false,
        colors: true,
      }),
    )
  }
}

if (config.watch) {
  webpack(config, callback)
} else {
  webpack(config).run(callback)
}

// 退出
//ctrl+c
process.on('SIGINT', () => {
  process.exit()
})
//当前进程被kill
process.on('SIGTERM', () => {
  process.exit()
})
