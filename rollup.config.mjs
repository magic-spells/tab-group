import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';

const dev = process.env.ROLLUP_WATCH;
const name = 'tab-group';

// CSS plugin factories — each build entry needs its own instance
const cssPlugin = () => postcss({
  extract: `${name}.css`,
  minimize: false,
  sourceMap: dev,
  extensions: ['.css'],
});

const cssMinPlugin = () => postcss({
  extract: `${name}.min.css`,
  minimize: true,
  sourceMap: dev,
  extensions: ['.css'],
});

export default [
  // ESM build
  {
    input: 'src/tab-group.js',
    output: {
      file: `dist/${name}.esm.js`,
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      cssPlugin(),
    ],
  },
  // CommonJS build
  {
    input: 'src/tab-group.js',
    output: {
      file: `dist/${name}.cjs.js`,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [resolve(), cssPlugin()],
  },
  // UMD build
  {
    input: 'src/tab-group.js',
    output: {
      file: `dist/${name}.js`,
      format: 'umd',
      name: 'TabGroup',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [resolve(), cssPlugin()],
  },
  // Minified UMD for browsers
  {
    input: 'src/tab-group.js',
    output: {
      file: `dist/${name}.min.js`,
      format: 'umd',
      name: 'TabGroup',
      sourcemap: false,
      exports: 'named',
    },
    plugins: [
      resolve(),
      cssMinPlugin(),
      terser({
        keep_classnames: true,
        format: {
          comments: false,
        },
      }),
    ],
  },
  // Development build
  ...(dev
    ? [
        {
          input: 'src/tab-group.js',
          output: {
            file: `dist/${name}.dev.js`,
            format: 'es',
            sourcemap: true,
          },
          plugins: [
            resolve(),
            cssMinPlugin(),
            serve({
              contentBase: ['dist', 'demo'],
              open: true,
              port: 3000,
            }),
            copy({
              targets: [
                {
                  src: `dist/${name}.dev.js`,
                  dest: 'demo',
                  rename: `${name}.esm.js`,
                },
                {
                  src: `dist/${name}.dev.js.map`,
                  dest: 'demo',
                  rename: `${name}.esm.js.map`,
                },
                {
                  src: `dist/${name}.min.css`,
                  dest: 'demo',
                },
              ],
              hook: 'writeBundle',
            }),
          ],
        },
      ]
    : []),
];
