import { NextResponse } from "next/server";

export async function GET() {
  const debugInfo = {
    VERCEL_URL: process.env.VERCEL_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
    baseUrl: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.BETTER_AUTH_URL || "http://localhost:3000",
    googleCallbackExpected: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/auth/callback/google`
      : (process.env.BETTER_AUTH_URL || "http://localhost:3000") +
        "/api/auth/callback/google",
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET",
  };

  return NextResponse.json(debugInfo);
}
