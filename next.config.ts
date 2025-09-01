import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', '192.168.1.105'],
  images: {
    remotePatterns: [new URL('https://cdn.discordapp.com/avatars/**')],
  },
};

export default nextConfig;
