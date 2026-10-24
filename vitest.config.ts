import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^katex\\/dist\\/katex\\.min\\.css$/,
        replacement: path.resolve(process.cwd(), 'test-empty.css'),
      },
    ],
  },
  test: {
    environment: 'node',
  },
});
