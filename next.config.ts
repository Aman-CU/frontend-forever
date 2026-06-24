import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  ...(process.env.NEXT_ALLOWED_DEV_ORIGINS && {
    allowedDevOrigins: process.env.NEXT_ALLOWED_DEV_ORIGINS.split(","),
  }),
};

export default nextConfig;
