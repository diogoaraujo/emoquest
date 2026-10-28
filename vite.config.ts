import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base relativa + roteamento por hash: funciona no GitHub Pages em /emoquest/ sem configuração extra.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // Em desenvolvimento, /api vai para o servidor local (pasta server/).
  server: { proxy: { '/api': 'http://localhost:3333' } },
  preview: { proxy: { '/api': 'http://localhost:3333' } },
})
