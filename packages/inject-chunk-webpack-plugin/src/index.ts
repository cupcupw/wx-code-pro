import { Chunk, Compilation, Compiler, sources } from 'webpack'
export default class InjectChunkWebpackPlugin {
  apply(compiler: Compiler) {
    console.log('this is InjectChunkWebpackPlugin =>')
  }
}
