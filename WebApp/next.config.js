/** @type {import('next').NextConfig} */
//const { nextI18NextRewrites } = require("next-i18next/rewrites");
const { i18n } = require("./library/i18n/config");

const nextConfig = {
  reactStrictMode: true,
  //rewrites: async () => nextI18NextRewrites(localeSubpaths),
  i18n,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
      }
    ],
  },
}

module.exports = nextConfig
