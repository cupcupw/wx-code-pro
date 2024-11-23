import path from 'path'
import { Compilation, Compiler, type EntryNormalized } from 'webpack'

const NAME = 'AppJsonWebpackPlugin'

export interface AppJsonWebpackPluginOptions {
  filterPages?: (entryKeys: string[]) => Promise<Record<string, any>>
  pageIndex?: string
}

export default class AppJsonWebpackPlugin {
  options: AppJsonWebpackPluginOptions

  constructor(options: AppJsonWebpackPluginOptions = {}) {
    this.options = options
  }
  //根据pages/目录修改app.json 
  //entry已经保存了 所有page 但是注意这里的page 名称必须为index.ts 如 pages/log/index.ts
  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(NAME, (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        async (assets, callback) => {
          try {
            for (const name in assets) {
              if (name.endsWith('app.json')) {
                const appJsonPages = await this.getAppJsonPages(compiler.options.entry)
                console.log('appJsonPages =>' , appJsonPages );
                const json = JSON.parse(assets[name].source().toString())
                const content = JSON.stringify(Object.assign(json, appJsonPages), null, 2)
                assets[name] = Object.assign({}, assets[name], {
                  source: () => content,
                  size: () => content.length,
                })  
              }
            }
            callback()
          } catch (err) {
            callback(err as any)
          }
        },
      )
    })
  }

  async getAppJsonPages(entry: EntryNormalized) {
    const entryData = typeof entry === 'function' ? await entry() : entry
    const entryKeys = Object.keys(entryData)
    console.log('entryKeys =>' , entryKeys );
    if (this.options.filterPages) {
      return this.options.filterPages(entryKeys)
    }

    const source = entryKeys
      .filter((key) => {
        if (key.includes(`components${path.sep}`)) {
          return false
        }
        return key.endsWith(`${path.sep}index`)
      })
      .map((item) => item.split(path.sep).join('/'))

    let pages: string[] = []
    console.log('source =>' , source );
    const subpackages: { root: string; name: string; pages: string[] }[] = []
    source.forEach((item) => {
      if (item.startsWith('pages/')) {
        pages.push(item)
      } else {
        const [name, ...rest] = item.split('/')
        let subpackage = subpackages.find((item) => item.name === name)
        if (!subpackage) {
          subpackage = { name, root: name, pages: [] }
          subpackages.push(subpackage)
        }
        subpackage.pages.push(rest.join('/'))
      }
    })

    // 将 pageIndex 移动到第一位
    if (this.options.pageIndex) {
      pages = pages.filter((item) => item !== this.options.pageIndex)
      pages.unshift(this.options.pageIndex)
    }

    return { pages, subpackages }
  }
}
