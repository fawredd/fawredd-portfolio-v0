const nextConfig = {
  reactStrictMode: true,
  env: {
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
    GEMINI_API_TEXT: process.env.GEMINI_API_TEXT,
    GITHUB_USER: process.env.GITHUB_USER,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'faw-github-readme-stats.vercel.app',
        port: '',
        pathname: '/api**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },

    ],
  },
}

module.exports = nextConfig

