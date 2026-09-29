/// <reference types="vitest/config" />
import { existsSync, readdirSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import remarkGfm from 'remark-gfm'
import { defineConfig, type Plugin } from 'vite'

// Removes WASM assets > 25 MiB from dist so Cloudflare Workers accepts the upload.
// The embeddings worker fetches them from CDN via env.backends.onnx.wasm.wasmPaths.
function cfWasmBudget(): Plugin {
  return {
    name: 'cf-wasm-budget',
    apply: 'build',
    closeBundle() {
      const assetsDir = join('dist', 'assets')
      if (!existsSync(assetsDir)) return
      const limit = 25 * 1024 * 1024
      for (const f of readdirSync(assetsDir)) {
        if (!f.endsWith('.wasm')) continue
        const full = join(assetsDir, f)
        if (statSync(full).size > limit) {
          console.warn(`\n[cf-wasm-budget] Removing ${f} (${(statSync(full).size / 1024 / 1024).toFixed(1)} MiB > 25 MiB limit)`)
          unlinkSync(full)
        }
      }
    },
  }
}

export default defineConfig({
  // En GitHub Pages el sitio vive en /ai-atlas/; en dev corre en /
  base: process.env.VITE_BASE_URL ?? '/',
  plugins: [
    cfWasmBudget(),
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
