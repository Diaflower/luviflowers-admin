/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["imagedelivery.net"],
  },
  async headers() {
    return [
      {
        source: "/firebase-messaging-sw.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
