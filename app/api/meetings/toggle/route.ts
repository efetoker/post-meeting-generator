// app/api/meetings/toggle/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { event, isEnabled, link, platform } = await request.json();

    await prisma.meeting.upsert({
      where: { googleEventId: event.id },
      update: {
        recordingEnabled: isEnabled,
        meetingLink: link,
        platform: platform,
      },
      create: {
        googleEventId: event.id,
        title: event.summary || "No Title",
        startTime: new Date(event.start.dateTime || event.start.date),
        recordingEnabled: isEnabled,
        userId: session.user.id,
        meetingLink: link,
        platform: platform,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling meeting recording:", error);
    return NextResponse.json(
      { error: "Failed to update meeting status." },
      { status: 500 }
    );
  }
}
