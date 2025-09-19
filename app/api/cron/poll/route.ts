// app/api/cron/poll/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    await prisma.cronLog.create({
      data: {
        message: "Polling cron job executed.",
      },
    });
  } catch (logError) {
    console.error("Failed to log cron job execution:", logError);
  }

  console.log("Cron job started: Polling for meeting transcripts.");

  try {
    const meetingsToPoll = await prisma.meeting.findMany({
      where: {
        recordingEnabled: true,
        recallBotId: { not: null },
        status: "SCHEDULED",
        startTime: { lt: new Date() },
      },
    });

    if (meetingsToPoll.length === 0) {
      console.log("No meetings to poll.");
      return NextResponse.json({
        success: true,
        message: "No meetings to poll.",
      });
    }

    for (const meeting of meetingsToPoll) {
      if (!meeting.recallBotId) continue;

      console.log(`Polling status for bot: ${meeting.recallBotId}`);

      const response = await fetch(
        `https://us-west-2.recall.ai/api/v1/bot/${meeting.recallBotId}`,
        {
          headers: {
            Authorization: `Token ${process.env.RECALL_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        console.error(`Failed to get status for bot ${meeting.recallBotId}`);
        continue;
      }

      const botData = await response.json();

      if (botData.transcript?.status === "done") {
        console.log(
          `Transcript ready for bot: ${botData.id}. Updating database.`
        );

        const transcriptText = JSON.stringify(botData.transcript.text);

        await prisma.meeting.update({
          where: { id: meeting.id },
          data: {
            transcript: transcriptText,
            status: "COMPLETED",
          },
        });
      }
    }

    return NextResponse.json({ success: true, polled: meetingsToPoll.length });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
