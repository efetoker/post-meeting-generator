// app/api/settings/facebook-page/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { pageId, pageAccessToken } = await request.json();
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        defaultFacebookPageId: pageId,
        facebookPageAccessToken: pageAccessToken,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save Facebook page selection:", error);
    return NextResponse.json(
      { error: "Failed to save selection." },
      { status: 500 }
    );
  }
}
