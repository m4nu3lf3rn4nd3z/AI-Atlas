/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import remarkGfm from 'remark-gfm'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkGfm],
        providerImportSource: '@mdx-js/react',
      }),
    },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    // The BPE vocabularies (o200k ≈ 2 MB) are large by nature and only
    // load on demand in the tokenizer views.
    chunkSizeWarningLimit: 2100,
  },
  // Workers import transformers.js as an ES module.
  worker: { format: 'es' },
  optimizeDeps: {
    // transformers.js resolves its WASM runtime at run time; pre-bundling breaks that.
    exclude: ['@huggingface/transformers'],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
