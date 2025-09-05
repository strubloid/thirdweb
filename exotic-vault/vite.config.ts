import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.VITE_HOST || '0.0.0.0',
    port: parseInt(process.env.VITE_PORT || '5173'),
    // only run hmr if we have set the vite_host
    ...(process.env.VITE_HOST && {
      hmr: { 
        host: process.env.VITE_HOST,
      },
    }),
  },
});
