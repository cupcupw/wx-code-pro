# wx-code-pro

## 初步版本目标

- 支持 `ts`
- 支持 `sass`
- 支持 `app.json` 自动生成
- 支持分包策略
- 支持事件传递参数

## webpack loader plugin
- https://juejin.cn/post/6976052326947618853?searchId=20241121100530667A3CC83272CDCBC3FC#heading-13

## webpack 插件
- 要熟悉插件必须先了解webpack hook规则
- compiler里的hook对象是通过tapable包创建的
- tapable出了很多hook对象
- SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncParallelHook,
  AsyncParallelBailHook, 
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook
- 基本hook: AsyncParallelHook AsyncSeriesHook 这个钩子只是简单地调用它连续点击的每个函数
- Waterfall hook: 会连续调用每个点击的函数。与基本挂钩不同，它将每个函数的返回值传递给下一个函数
- bail hook: 允许提前退出。当任何一个点击的函数返回任何内容时，bail hook 将停止执行其余的函数
- loop hook: 插件返回非未定义值时，钩子将从第一个插件重新启动。它将循环直到所有插件返回未定义。
- Sync 同步挂钩只能使用同步函数（使用myHook.tap() ）进行点击
- AsyncSeries 异步系列钩子可以使用同步、基于回调和基于 Promise 的函数（使用myHook.tap() 、 myHook.tapAsync()和myHook.tapPromise() ）进行点击。他们连续调用每个异步方法。
- AsyncParallel 异步并行。异步并行钩子还可以通过同步、基于回调和基于 Promise 的函数进行点击（使用myHook.tap() 、 myHook.tapAsync()和myHook.tapPromise() ）。但是，它们并行运行每个异步方法。
- Interception 所有 Hook 都提供额外的拦截 API：
- call : (...args) => void添加对拦截器的call将在触发钩子时触发。您可以访问 hooks 参数。
- tap : (tap: Tap) => void将tap添加到拦截器将在插件点击钩子时触发。提供的是Tap对象。 Tap对象无法更改。
- Loop : (...args) => void将loop添加到拦截器将触发循环钩子的每个循环。
- register : (tap: Tap) => Tap | undefined将register添加到拦截器将为每个添加的Tap触发并允许对其进行修改。
- Context: 插件和拦截器可以选择访问可选的context对象，该对象可用于将任意值传递给后续插件和拦截器。
- 具体参考 ：https://github.com/webpack/tapable#tapable

## webpack概念
- ‌webpack中的chunk和bundle是构建过程中的两个重要概念，它们在构建过程中扮演着不同的角色。‌
- webpack 会构建 文件依赖 一个文件关联的文件成为chunk 多个入口文件都依赖的一个chunk就需要用到代码分割
- bundle 就是根据规则征程的代码块 比如把多个chunk打包成一个bundle

定义和作用
‌Chunk‌：在webpack中，chunk是指一个代码块，它由多个模块组合而成。当webpack执行构建时，会根据入口文件和依赖关系生成多个chunk。这些chunk包含了模块的代码，但还没有经过最终的打包处理‌12。
‌Bundle‌：bundle是最终生成的文件，它包含了所有的chunk和模块。在webpack执行构建时，会把每个chunk打包成一个bundle文件。bundle文件经过了加载和编译，可以直接在浏览器中运行‌13。

## 搭建cli
- package下的bin选项会添加到node_module的.bin目录 npm run 调用脚本时会去.bin下去找(不是环境变量)
- @babel/core
- babel.transform(code, options, function(err, result) {
    result; // => { code, map, ast }
  });
- @babel/preset-env
- @babel/polyfill 
- https://juejin.cn/post/7126465727178997791?searchId=202411211639140CA0EA8768C2600DB845#heading-17
- 这个包是全量引入垫片

- @babel/preset-env
- 配置@babel/preset-env 可以搭配 corejs实现按需引入

## bable总结
- 我们知道，@babel/polyfill、@babel/preset-env 和 @babel/plugin-transform-runtime 都能用来引入polyfill的。那到底该怎么选择呢？
@babel/polyfill不用多说了，肯定不是首选，因为它全局引入，并且还会污染环境。
@babel/preset-env 的 usage方案其实就是按需引入@babel/polyfill，所以它不会全局引入，但是它直接引入的polyfill会污染全局环境，并且每次还会创建多余的辅助函数，会增大构建后代码体积。
@babel/plugin-transform-runtime插件搭配@babel/runtime或者@babel/runtime-corejs3
优势就是

抽离重复注入的 helper 代码，减少构建后包的体积。
每次引入 polyfill 都会定义别名，所以不会污染全局。

缺点就是

由于每次引入 polyfill 都会定义别名，所以会导致多个文件出现重复代码。

好了说了这么多，那到底该怎么选择
写类库的时候用runtime，系统项目还是用polyfill。写库使用 runtime 最安全，如果我们使用了 includes，但是我们的依赖库 B 也定义了这个函数，这时我们全局引入 polyfill 就会出问题：覆盖掉了依赖库 B 的 includes。如果用 runtime 就安全了，会默认创建一个沙盒,这种情况 Promise 尤其明显，很多库会依赖于 bluebird 或者其他的 Promise 实现,一般写库的时候不应该提供任何的 polyfill 方案，而是在使用手册中说明用到了哪些新特性，让使用者自己去 polyfill。
话说的已经很明白了，该用哪种形式是看项目类型了，不过通常对于一般业务项目来说，还是plugin-transform-runtime处理工具函数，babel-polyfill处理兼容。也就是说使用@babel/preset-env配置usage来按需引入polyfill，并配置plugin-transform-runtime来抽取公共方法减少代码整体体积。
项目开发最佳配置如下：
js 代码解读复制代码{
  "presets": [
    [
      // 编译js并按需提供polyfill
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": "3"
      }
    ]
  ],

  // 提取辅助函数
  "plugins": ["@babel/plugin-transform-runtime"]
} 

## eslint和prettier
- eslint 9 与编辑器兼容有些问题12
-  pnpm i eslint prettier -D -w
-  eslint-config-prettier，eslint-plugin-prettier 
-  Linters 通常不仅包含代码质量规则，还包含样式规则。使用 Prettier 时，大多数样式规则都是不必要的，但更糟糕的是，它们可能与 Prettier 冲突！使用 Prettier 处理代码格式问题，使用 Linters 处理代码质量问题
-  参考https://github.com/prettier/eslint-plugin-prettier
-  npm i @typescript-eslint/eslint-plugin 指定了 ts 代码规范的 plugin
-  npm i @typescript-eslint/parser   // 解析器，使 eslint 可以解析 ts 语法

## husky
- prepare命令会在执行npm install（不带参数的情况下）之后自动执行。也就是说当我们执行npm install安装完项目依赖后会执行husky install命令，该命令会创建.husky/并指定该目录为git hooks所在的目录。这里我们先手动执行一次npm run prepare,会创建.husky目录。
- 提交前钩子验证待完成
