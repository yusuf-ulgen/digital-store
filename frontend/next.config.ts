import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["picsum.photos"],
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos", pathname: "/**" }],
  },
};

module.exports = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }, // ihtiyacına göre daralt
    ],
  },
};

export default nextConfig;
