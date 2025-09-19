// app/api/post/linkedin/route.ts

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
    if (!content) {
      return NextResponse.json(
        { error: "Content is required." },
        { status: 400 }
      );
    }

    const linkedInAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "linkedin",
      },
    });

    if (!linkedInAccount?.access_token || !linkedInAccount.providerAccountId) {
      return NextResponse.json(
        { error: "LinkedIn account not connected." },
        { status: 400 }
      );
    }

    const accessToken = linkedInAccount.access_token;
    const linkedInPersonId = linkedInAccount.providerAccountId;

    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0", // Required by LinkedIn API
      },
      body: JSON.stringify({
        author: `urn:li:person:${linkedInPersonId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "CONNECTIONS", // Or PUBLIC
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("LinkedIn API Error:", errorBody);
      throw new Error("Failed to post to LinkedIn.");
    }

    return NextResponse.json({
      success: true,
      message: "Posted to LinkedIn successfully.",
    });
  } catch (error) {
    console.error("Error posting to LinkedIn:", error);
    return NextResponse.json(
      { error: "Failed to post to LinkedIn." },
      { status: 500 }
    );
  }
}
