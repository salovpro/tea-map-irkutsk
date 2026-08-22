import withPWAInit from "@ducanh2912/next-pwa";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  cacheStartUrl: false,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    cacheId: "tea-map-20260821",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep node-postgres out of webpack. Edge instrumentation has no `fs`.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "pg-native",
    "pg-connection-string",
  ],
  // next-pwa injects a webpack plugin; empty turbopack config keeps Next.js 16 happy in dev
  turbopack: {},
  /**
   * `/media/venues/<uuid>.jpg` looks like a static file. Next.js checks `public/`
   * first and 404s before the Route Handler runs. Rewrite to an extensionless
   * internal path so GET always hits Node.
   */
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/media/venues/:id.:ext",
          destination: "/media/file/:id/:ext",
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/swe-worker-:hash.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

const withPlugins = withPWA(withNextIntl(nextConfig));

export default {
  ...withPlugins,
  webpack(config, options) {
    const resolved = withPlugins.webpack
      ? withPlugins.webpack(config, options)
      : config;
    const { nextRuntime } = options;
    // pg-connection-string require()s `fs` behind a ternary. Webpack still
    // resolves it for Node, Edge, and the browser — stub it everywhere.
    resolved.resolve.fallback = {
      ...(resolved.resolve.fallback ?? {}),
      fs: false,
      net: false,
      tls: false,
      dns: false,
      "pg-native": false,
    };
    if (nextRuntime === "edge") {
      const edgeStubs = {
        pg: false,
        "pg-native": false,
        "pg-connection-string": false,
        "@prisma/adapter-pg": false,
      };
      const alias = resolved.resolve.alias;
      if (Array.isArray(alias)) {
        for (const [name, value] of Object.entries(edgeStubs)) {
          alias.push({ name, alias: value });
        }
      } else {
        resolved.resolve.alias = { ...(alias ?? {}), ...edgeStubs };
      }
    }
    return resolved;
  },
};
