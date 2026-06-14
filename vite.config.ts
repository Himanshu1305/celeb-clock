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
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-select',
            '@radix-ui/react-accordion',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-avatar',
            '@radix-ui/react-slider',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-progress',
            '@radix-ui/react-separator',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-switch',
            '@radix-ui/react-collapsible',
          ],
          'vendor-charts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-lucide': ['lucide-react'],
          'chunk-shared': [
            './src/hooks/useAuth',
            './src/utils/trialUtils',
            './src/services/WikipediaImageService',
          ],
          // birthdayData removed from here — it's now dynamically imported
          // so Vite lazy-loads it as its own separate chunk
          // BirthdayDate removed: it imports birthstoneData (chunk-content), which caused
          // a chunk-birthday <-> chunk-content circular dep. Let it land in the index chunk.
          'chunk-birthday': [
            './src/pages/BirthdayResults',
            './src/pages/TodaysBirthdaysPage',
            './src/pages/CelebrityBirthday',
            './src/services/BirthdaySearchService',
            './src/data/celebrityNationality',
          ],
          'chunk-longevity': [
            './src/services/LongevityCalculationService',
            './src/services/CelebrityLongevityService',
            './src/components/LifeExpectancyCalculator',
            './src/components/WhatIfSimulator',
            './src/components/EnhancedLifeExpectancyReport',
            './src/components/CulturalHorizonTeaser',
            './src/components/HealthGuideSection',
            './src/data/longevityIcons',
          ],
          'chunk-longevity-extra': [
            './src/components/WorldLongevityRecords',
          ],
          'chunk-zodiac': [
            './src/data/zodiacData',
            './src/pages/ZodiacSign',
          ],
          'chunk-content': [
            './src/data/birthstoneData',
            './src/data/numerologyData',
            './src/data/blogPosts',
            './src/pages/BirthstonePage',
            './src/pages/NumerologyNumber',
            './src/pages/BlogPost',
          ],
          'chunk-planets': [
            './src/pages/PlanetaryAgePage',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
