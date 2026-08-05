/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "ali-oss",
    "cos-nodejs-sdk-v5",
    "@aws-sdk/client-s3",
  ],
}

export default nextConfig
