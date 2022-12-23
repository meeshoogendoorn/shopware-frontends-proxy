import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import { defineNuxtModule, addServerHandler } from '@nuxt/kit';
import type { Options } from 'http-proxy-middleware';

function createProxyMiddleware(options: Options, index?: number) {
  return `
    import { createProxyMiddleware } from 'nuxt-proxy/middleware'
    import { defu } from 'defu'
    import { useRuntimeConfig } from '#imports'
    const buildtimeOptions = ${JSON.stringify(options)}
    const runtimeOptions = [].concat(useRuntimeConfig().proxy?.options)[${JSON.stringify(
      index
    )} ?? 0]
    export default createProxyMiddleware(defu(runtimeOptions, buildtimeOptions))
  `;
}

export interface ModuleOptions {
  proxy: boolean;
  shopwareEndpoint: string;
  proxyDestinationEndpoint: string;
  shopwareAccessToken: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'shopware-frontends-proxy',
    configKey: 'shopware',
  },
  defaults: {
    proxy: false,
    proxyDestinationEndpoint: 'https://demo-frontends.shopware.store',
    shopwareEndpoint: 'http://localhost:3000',
    shopwareAccessToken: 'SWSCBHFSNTVMAWNZDNFKSHLAYW',
  },
  setup(options, nuxt) {
    if (options.proxy && options.proxyDestinationEndpoint) {
      const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url));
      nuxt.options.build.transpile.push(runtimeDir);

      const config = {
        options: {
          target: options.proxyDestinationEndpoint,
          changeOrigin: true,
          pathRewrite: {
            '^/store-api': '/store-api',
            '^/media': '/media',
          },
          pathFilter: ['/store-api', '/media'],
        },
      };

      nuxt.hook('nitro:config', (nitroConfig) => {
        nitroConfig.virtual = nitroConfig.virtual || {};
        const handler = '#proxy-handler';
        nitroConfig.virtual[handler] = createProxyMiddleware(config.options);

        addServerHandler({
          handler,
          middleware: true,
        });
      });
    }
  },
});
