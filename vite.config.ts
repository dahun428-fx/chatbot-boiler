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

  // LLM API 프록시 설정 (API Key 숨김)
  const llmProvider = env.VITE_LLM_PROVIDER;
  const llmApiKey = env.LLM_API_KEY; // VITE_ 접두사 없음 - 서버에서만 사용

  if (llmProvider === 'gemini' && llmApiKey) {
    proxy['/llm-proxy/gemini'] = {
      target: 'https://generativelanguage.googleapis.com',
      changeOrigin: true,
      rewrite: (path) => {
        // /llm-proxy/gemini/v1beta/models/... -> /v1beta/models/...?key=API_KEY
        const newPath = path.replace('/llm-proxy/gemini', '');
        return newPath.includes('?')
          ? `${newPath}&key=${llmApiKey}`
          : `${newPath}?key=${llmApiKey}`;
      },
    };
  }

  if (llmProvider === 'openai' && llmApiKey) {
    proxy['/llm-proxy/openai'] = {
      target: 'https://api.openai.com',
      changeOrigin: true,
      rewrite: (path) => path.replace('/llm-proxy/openai', ''),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq) => {
          proxyReq.setHeader('Authorization', `Bearer ${llmApiKey}`);
        });
      },
    };
  }

  if (llmProvider === 'anthropic' && llmApiKey) {
    proxy['/llm-proxy/anthropic'] = {
      target: 'https://api.anthropic.com',
      changeOrigin: true,
      rewrite: (path) => path.replace('/llm-proxy/anthropic', ''),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq) => {
          proxyReq.setHeader('x-api-key', llmApiKey);
          proxyReq.setHeader('anthropic-version', '2023-06-01');
        });
      },
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
