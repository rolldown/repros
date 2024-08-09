import pkg from '@vue/consolidate/package.json' assert { type: 'json' }

export default [
  {
    input: './main.js',
    platform: 'node',
    external: Object.keys(pkg.devDependencies),
    treeshake: {
      moduleSideEffects: false
    },
    output: {
      entryFileNames: `main-wrong.js`
    }
  },
  {
    input: './main.js',
    platform: 'node',
    external: Object.keys(pkg.devDependencies),
    output: {
      entryFileNames: `main-correct.js`
    }
  }
]
