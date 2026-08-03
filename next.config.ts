import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - This property is requested by the Next.js error log but may not be in NextConfig types yet
  allowedDevOrigins: ['192.168.1.90'],
};

export default nextConfig;
