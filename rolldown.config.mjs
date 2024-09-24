import { defineConfig } from 'rolldown'

export default defineConfig({
  input: './main.js',
  define: {
    X: '123'
  }
})
