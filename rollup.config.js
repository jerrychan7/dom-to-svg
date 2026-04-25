import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const userscriptHeader = `// ==UserScript==
// @name         dom-to-svg
// @namespace    https://github.com/felixfbecker/dom-to-svg
// @version      0.1.0
// @description  Select any DOM element on the page and save it as an SVG file
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

`

export default [
  // regular library bundle
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/bundle.js',
      format: 'iife',
      name: 'DomToSvg',
    },
    plugins: [
      resolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        sourceMap: false,
      }),
    ],
  },
  // tampermonkey userscript
  {
    input: 'userscript/entry.js',
    output: {
      file: 'userscript/dom-to-svg.user.js',
      format: 'iife',
      banner: userscriptHeader,
    },
    plugins: [
      resolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.userscript.json',
        declaration: false,
        declarationMap: false,
        sourceMap: false,
      }),
    ],
  },
]
