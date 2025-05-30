import path from "node:path";
import { defineConfig } from "rollup";

import Commonjs from "@rollup/plugin-commonjs";
import Babel from "@rollup/plugin-babel";
import VuePlugin from "rollup-plugin-vue";

function resolvePath(dir, baseDir = process.cwd()) {
  return path.resolve(baseDir, dir);
}

export default defineConfig([
  {
    input: resolvePath("./src/index.js"),
    output: {
      file: resolvePath("./dist/index.js"),
      format: "esm",
    },
    plugins: [
      Commonjs(),
      Babel({
        exclude: /node_modules/,
        babelHelpers: "runtime",
      }),
      VuePlugin(),
    ],
  },
]);
