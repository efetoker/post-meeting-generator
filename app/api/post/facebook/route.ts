// app/api/post/facebook/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content } = await request.json();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.defaultFacebookPageId || !user.facebookPageAccessToken) {
      return NextResponse.json(
        { error: "No default Facebook Page selected." },
        { status: 400 }
      );
    }

    const postUrl = `https://graph.facebook.com/${user.defaultFacebookPageId}/feed`;
    const response = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: content,
        access_token: user.facebookPageAccessToken,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return NextResponse.json({
      success: true,
      message: "Posted to Facebook successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
