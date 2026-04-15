import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "image.mux.com" }],
  },
};

export default config;
