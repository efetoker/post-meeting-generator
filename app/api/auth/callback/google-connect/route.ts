// app/api/auth/callback/google-connect/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  if (!code || !userId) {
    return NextResponse.redirect(
      new URL("/settings?error=OAuthCallback", request.url)
    );
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.AUTH_URL}/api/auth/callback/google-connect`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();
    if (tokens.error) throw new Error(tokens.error_description);

    const profileResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );
    const profile = await profileResponse.json();

    await prisma.account.create({
      data: {
        userId: userId,
        type: "oauth",
        provider: "google",
        providerAccountId: profile.sub,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope,
      },
    });
  } catch (error) {
    console.error("Error connecting new Google account:", error);
    return NextResponse.redirect(
      new URL("/settings?error=ConnectionFailed", request.url)
    );
  }

  return NextResponse.redirect(
    new URL("/settings?success=Connected", request.url)
  );
}
