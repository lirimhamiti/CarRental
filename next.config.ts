import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure the Cyrillic-capable font files used for contract PDF generation
  // are included in the deployed serverless function bundle.
  outputFileTracingIncludes: {
    "/api/contracts/**": ["./src/assets/fonts/**"],
  },
};

export default nextConfig;
