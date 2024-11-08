import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' https://demo-iframe-ten.vercel.app https://demo-iframe-green.vercel.app`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
