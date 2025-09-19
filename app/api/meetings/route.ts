// app/api/meetings/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pastMeetings = await prisma.meeting.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json(pastMeetings);
  } catch (error) {
    console.error("Failed to fetch past meetings:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
