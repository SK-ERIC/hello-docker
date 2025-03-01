/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // 必须配置为静态导出
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true, // 确保静态导出兼容性
};

module.exports = nextConfig;
