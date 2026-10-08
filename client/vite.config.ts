import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    // This is an npm workspace; react/react-dom are hoisted to the repo root,
    // so make sure only one copy is ever resolved (avoids dep-optimizer/module
    // resolution mismatches across packages that peer-depend on react).
    dedupe: ['react', 'react-dom'],
  },
})