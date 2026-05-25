import type { NextConfig } from "next";

const isMobileBuild = process.env.MOBILE_BUILD === "true";

const nextConfig: NextConfig = {
  ...(isMobileBuild ? { output: "export" } : {}),
  images: {
    ...(isMobileBuild ? { unoptimized: true } : {}),
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "export",
};

export default nextConfig;
