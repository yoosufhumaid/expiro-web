import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === "development" && {
    turbopack: {
      root: "/Users/yoosuf/Projects/lifeos",
    },
  }),
};

export default nextConfig;
