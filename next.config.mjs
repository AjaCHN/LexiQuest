/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Makers/EdgeOne 沙箱预览使用 127.0.0.1 域名，若不在此白名单，
  // Next 会拦截 HMR 握手，导致页面“看起来正常但按钮点不动”。
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
