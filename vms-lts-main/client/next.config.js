/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    BACKEND_GRAPHQL_URL: process.env.BACKEND_GRAPHQL_URL,
    BACKEND_URL: process.env.BACKEND_URL,
    NEXT_PUBLIC_FACE_REC_URL: process.env.NEXT_PUBLIC_FACE_REC_URL || 'http://localhost:3003'
  }
}
