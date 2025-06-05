import path from 'path'
import { defineConfig } from 'rollup'

import clear from 'rollup-plugin-clear'
import vue from 'rollup-plugin-vue'
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig([
  {
    input: resolvePath('src/index.js'),
    output: {
      file: resolvePath('dist/index.js'),
      format: 'esm'
    },
    plugins: [
      clear({
        targets: [resolvePath('dist')]
      }),
      vue(),
      commonjs({
        defaultIsModuleExports: false
      }),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        extensions: ['.js', '.vue']
      })
      // terser(),
    ]
  }
])

function resolvePath(dir) {
  return path.resolve(process.cwd(), dir)
}
