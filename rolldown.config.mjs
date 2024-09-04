import { defineConfig } from 'rolldown'

export default defineConfig({
  input: './main.js',
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})
