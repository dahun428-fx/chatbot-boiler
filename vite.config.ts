import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import type { ProxyOptions } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const rawBase = env.VITE_BASE ?? '/';
  const BASE = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const BASE_TRIMMED = BASE.replace(/^\/|\/$/g, '');

  // 프록시 설정 빌드 (빈 값일 경우 제외)
  const proxy: Record<string, ProxyOptions> = {};

  if (env.VITE_PUBLIC_PROXY_CHAT_END_POINT) {
    proxy['/api/setChatDialog'] = {
      target: env.VITE_PUBLIC_PROXY_CHAT_END_POINT,
      changeOrigin: true,
      secure: false,
    };
  }

  if (env.VITE_PUBLIC_PROXY_END_POINT) {
    proxy['/api'] = {
      target: env.VITE_PUBLIC_PROXY_END_POINT,
      changeOrigin: true,
      secure: false,
    };
  }

  const config = {
    base: BASE,
    build: {
      outDir: BASE_TRIMMED ? `dist/${BASE_TRIMMED}` : 'dist',
      minify: 'esbuild' as const,
      chunkSizeWarningLimit: 1500,
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    plugins: [TanStackRouterVite({ autoCodeSplitting: true }), viteReact(), tsconfigPaths()],
    server: {
      proxy: Object.keys(proxy).length > 0 ? proxy : undefined,
    },
    publicDir: 'public',
  };

  return config;
});
