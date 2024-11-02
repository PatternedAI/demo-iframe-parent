import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' ${process.env.NEXT_PUBLIC_CHILD_SITE_URL}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
