import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// dev: `npm run dev` proxies the API to the backend running on 8765
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8765' } },
});
