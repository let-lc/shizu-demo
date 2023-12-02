import adapterAuto from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter:
      process.env.NODE_ENV === 'development'
        ? adapterAuto()
        : adapterStatic({
            pages: 'build',
            assets: 'build',
            fallback: '404.html',
            precompress: false,
            strict: true,
          }),
    paths: {
      base: process.env?.BASE_PATH || "",
    },
    alias: {
      $data: 'data',
    },
  },
};

export default config;
