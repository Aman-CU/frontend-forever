import path from "path";
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Prevents clickjacking — page cannot be embedded in a frame on another origin.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Prevents MIME-type sniffing — browsers must honour the declared Content-Type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // unsafe-inline + unsafe-eval: Next.js requires unsafe-inline for its hydration
      // scripts; unsafe-eval is additionally required by Monaco Editor (Features 24+).
      // To harden further, implement nonce-based CSP via proxy.ts when ready.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      // https://*.upstash.io for rate-limit requests (Feature 19+).
      "connect-src 'self' https://*.upstash.io",
      // frame-src: none until the code-execution sandbox iframe is added (Features 24-25);
      // update to 'self' at that point per security.md.
      "frame-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Set NEXT_ALLOWED_DEV_ORIGINS=<ip> in .env.local for LAN/mobile testing.
  // Omitting the key entirely (not setting it to an empty string) preserves
  // Next.js's default behaviour — an explicit [] activates strict origin checks.
  ...(process.env.NEXT_ALLOWED_DEV_ORIGINS
    ? { allowedDevOrigins: process.env.NEXT_ALLOWED_DEV_ORIGINS.split(",") }
    : {}),
  async headers() {
    // Security headers are production-only — in dev they interfere with
    // Turbopack's HMR WebSocket, Next.js dev overlays, and cause Framer
    // Motion's whileInView sections to stay invisible until re-render.
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
