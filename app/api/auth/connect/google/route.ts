// app/api/auth/connect/google/route.ts

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../[...nextauth]/route";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CONNECT_CLIENT_ID!,
    redirect_uri: `${process.env.AUTH_URL}/api/auth/callback/google-connect`,
    response_type: "code",
    scope:
      "openid profile email https://www.googleapis.com/auth/calendar.readonly",
    access_type: "offline",
    prompt: "consent",
    state: session.user.id,
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.redirect(url);
}
