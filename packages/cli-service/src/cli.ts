import webpack, { Stats }  from "webpack"
import { getConfig, parseArgv } from "./utils"

// argv 第一个值是node路径第二个是当前cli运行目录 后边是参数 wxcodepro-cli a b c
const argv = process.argv

//拿到配置相对目录 打包pageindex 是否监听
const options = parseArgv(argv)

// 根据cli参数生成webpack配置项
const config = getConfig(options)
console.log('config =>' , config );