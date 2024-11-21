import type { Config } from './config'

//辅助函数 类型推导支持
export function defineConfig(config: Config | ((config: Config) => Config)) {
  return config
}
