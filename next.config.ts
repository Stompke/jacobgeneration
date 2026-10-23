import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The roster is read from Google Sheets on each request.
  cacheComponents: false,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
