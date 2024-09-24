import { defineConfig } from 'rolldown'
import { replacePlugin } from 'rolldown/experimental'

export default defineConfig({
  input: './main.ts',
  plugins: [
    replacePlugin({
      '__DEV__': 'true'
    })
  ]
})
