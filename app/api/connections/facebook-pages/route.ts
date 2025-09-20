// app/api/connections/facebook-pages/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const facebookAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "facebook",
      },
    });

    if (!facebookAccount?.access_token) {
      return NextResponse.json(
        { error: "Facebook account not connected." },
        { status: 400 }
      );
    }

    const pagesUrl = `https://graph.facebook.com/me/accounts?access_token=${facebookAccount.access_token}`;

    const response = await fetch(pagesUrl);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return NextResponse.json(data.data);
  } catch (error: any) {
    console.error("Failed to fetch Facebook pages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
