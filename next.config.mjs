/** @type {import('next').NextConfig} */
const nextConfig = {
    // React 18 strict mode
    reactStrictMode: true,
    // If using generic image domains, add them here or use remotePatterns
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    // Ensure we don't try to use 'src/pages' if we are building 'src/app' structure
    // cleanDistDir: true,
};

export default nextConfig;
