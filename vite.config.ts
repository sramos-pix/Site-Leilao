import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: Number(process.env.PORT) || 5176,
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — sempre necessário
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // UI components — carregados em todas as páginas
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "lucide-react",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
          ],
          // Supabase — usado em quase todas as páginas
          "vendor-supabase": ["@supabase/supabase-js"],
          // Gráficos — só no dashboard admin
          "vendor-charts": ["recharts"],
          // Animações — páginas que usam framer-motion
          "vendor-motion": ["framer-motion"],
          // PDF/Excel — só nas páginas de exportação admin
          "vendor-export": ["jspdf", "jspdf-autotable", "xlsx"],
          // Formulários
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          // Pagamentos — só no checkout
          "vendor-stripe": ["@stripe/stripe-js"],
        },
      },
    },
  },
}));
