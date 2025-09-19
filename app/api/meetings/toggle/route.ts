// app/api/meetings/toggle/route.ts

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
    const { event, isEnabled, link, platform } = await request.json();

    let botId = null;

    if (isEnabled && link) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { botJoinOffsetMinutes: true },
      });

      const joinBeforeMinutes = user?.botJoinOffsetMinutes ?? 5;

      const meetingStartTime = new Date(
        event.start.dateTime || event.start.date
      );

      const joinAtTime = new Date(
        meetingStartTime.getTime() - joinBeforeMinutes * 60 * 1000
      );

      const scheduleResponse = await fetch(
        "https://us-west-2.recall.ai/api/v1/bot",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${process.env.RECALL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meeting_url: link,
            join_at: joinAtTime.toISOString(),
            // For now, the bot joins immediately. We will make this configurable later.
            // We could also add a transcription_options object here if needed.
          }),
        }
      );

      if (!scheduleResponse.ok) {
        console.error(
          "Failed to schedule Recall.ai bot:",
          scheduleResponse.statusText
        );
        const errorBody = await scheduleResponse.json();
        console.error("Recall.ai API Error:", errorBody);
        throw new Error("Failed to schedule Recall.ai bot.");
      }

      const botData = await scheduleResponse.json();
      botId = botData.id;
    }

    await prisma.meeting.upsert({
      where: { googleEventId: event.id },
      update: {
        recordingEnabled: isEnabled,
        meetingLink: link,
        platform: platform,
        recallBotId: botId,
      },
      create: {
        googleEventId: event.id,
        title: event.summary || "No Title",
        startTime: new Date(event.start.dateTime || event.start.date),
        recordingEnabled: isEnabled,
        userId: session.user.id,
        meetingLink: link,
        platform: platform,
        recallBotId: botId,
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
