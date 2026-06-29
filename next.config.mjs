/** @type {import('next').NextConfig} */
const nextConfig = {
  // All pages use cookies/auth so must be dynamic
  staticPageGenerationTimeout: 60,
}

export default nextConfig
