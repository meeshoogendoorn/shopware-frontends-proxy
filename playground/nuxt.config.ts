import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  modules: ['shopware-frontends-proxy'],
  shopware: {
    shopwareEndpoint: 'https://beheer.kippiedev.hypernode.io',
    shopwareAccessToken: 'SWSCWTKXULEZNGRKSDBLSG1IDQ',
    proxy: true,
  },
});
