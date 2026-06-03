/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Ignore build errors for typescript on deploy if any minor mismatch exists, ensuring build reliability
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ignore lint errors during build to avoid breaking deployments
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;
