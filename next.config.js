const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // 用于 Docker 构建
  reactStrictMode: true,
  images: {
    unoptimized: true, // 禁用图片优化
  },
  webpack: (config) => {
    config.resolve.alias['@'] = __dirname;
    return config;
  },
  compress: true, // 启用Gzip压缩
  productionBrowserSourceMaps: false, // 关闭生产环境sourcemap
};

module.exports = withBundleAnalyzer(nextConfig); 