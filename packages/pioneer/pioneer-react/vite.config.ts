// import thorswapViteConfig from '@internal/config';
import { resolve } from 'path';
import { defineConfig } from 'vite';

import { name } from './package.json';

const viteConfig = defineConfig({
  build: {
    lib: {
      name,
      entry: resolve(__dirname, 'src/index.tsx'),
    },
    rollupOptions: {
      external: ['react', 'uuid'],
      output: {
        globals: {
          react: 'React',
        },
      },
    },
  },
});

export default viteConfig;
