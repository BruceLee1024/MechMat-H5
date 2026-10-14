import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react(), {
    name: 'h5-formula-fonts',
    enforce: 'pre',
    transform(source, id) {
      if (!id.includes('/katex/dist/katex.min.css')) return;
      // 现代移动浏览器使用 WOFF2，避免把同一字体的 WOFF、TTF 也放入每个包。
      return source.replace(/src:([^;}]+);?/g, (declaration, sources: string) => {
        const woff2 = sources.split(',').find(value => value.includes('woff2'));
        return woff2 ? `src:${woff2};` : declaration;
      });
    },
  }],
  build: { target: 'es2020', assetsInlineLimit: 4_000_000, rollupOptions: { output: { inlineDynamicImports: true } } },
});
