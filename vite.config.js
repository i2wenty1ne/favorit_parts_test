import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createApiMiddleware } from './server/api.js';

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const apiPlugin = {
    name: 'favorit-api',
    configureServer(server) {
      server.middlewares.use(createApiMiddleware(env));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createApiMiddleware(env));
    },
  };
  return { plugins: [react(), apiPlugin] };
});
