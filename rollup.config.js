import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
	input: 'src/index.ts',
	output: {
		file: 'lib/bundle.js',
		format: 'iife',
		name: 'DomToSvg',
		globals: {
			// 浏览器环境已有的全局变量
			'postcss': 'postcss',
			'postcss-value-parser': 'postcssValueParser',
			'gradient-parser': 'gradientParser',
		},
	},
	plugins: [
		resolve({
			browser: true,
			preferBuiltins: false,
		}),
		commonjs(),
		typescript({
			tsconfig: './tsconfig.json',
			declaration: false,
			declarationMap: false,
			sourceMap: false,
		}),
	],
	external: [],
}
