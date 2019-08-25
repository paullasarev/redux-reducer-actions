const { terser } = require('rollup-plugin-terser');
const isProduction = process.env.BUILD === 'production';
export default {
  input: 'src/action-enhancer.js',
  output: {
    file: isProduction ? 'dist/bundle.min.js' : 'dist/bundle.js',
    format: 'cjs',
  },
  plugins: [
    isProduction && terser(),
  ]
}