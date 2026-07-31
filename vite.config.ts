import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
    // For CF local dev: replace vercel dev with: wrangler pages dev dist --port 3001
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split large third-party libs into their own long-cached chunks so app
        // code and vendors version independently, and heavy libs (charts) load only
        // on the routes that use them. Pure splitting — no behaviour change.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-router') || id.includes('/react-dom/') || id.includes('/react/') || id.includes('scheduler')) return 'react-vendor';
          if (id.includes('recharts') || id.includes('/d3-') || id.includes('/victory')) return 'charts';
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('class-variance-authority') || id.includes('cmdk')) return 'ui';
          return undefined;
        },
      },
    },
  },
}));
