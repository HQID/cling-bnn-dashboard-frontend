import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: "https://cling-backend-751576244523.asia-southeast2.run.app/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
