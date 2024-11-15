import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js', // Entry file
  output: [
    // for use as es module
    {
      file: 'dist/SwiftSellClientAPI.esm.js', // ESM output
      format: 'esm',
    },
    // for use in browser via <script> tag
    {
      file: 'dist/SwiftSellClientAPI.min.js', // Minified UMD output
      format: 'umd',
      name: 'SwiftSellClientAPI', // Global variable name for browsers
      plugins: [terser()],
    },
  ],
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
      babelHelpers: 'bundled',
    }),
    json(),
  ],
};
