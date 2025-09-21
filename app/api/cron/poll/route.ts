// app/api/cron/poll/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        status: { in: ["SCHEDULED", "PROCESSING", "TRANSCRIBING"] },
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

      const botStatusResponse = await fetch(
        `https://us-west-2.recall.ai/api/v1/bot/${meeting.recallBotId}`,
        {
          headers: { Authorization: `Token ${process.env.RECALL_API_KEY}` },
        }
      );

      if (!botStatusResponse.ok) {
        console.error(`Failed to get status for bot ${meeting.recallBotId}`);
        continue;
      }

      const botData = await botStatusResponse.json();

      if (meeting.status === "SCHEDULED") {
        const hasCallEnded = botData.status_changes?.some(
          (change: any) => change.code === "call_ended"
        );

        if (hasCallEnded) {
          console.log(
            `Call ended for bot: ${botData.id}. Updating status to PROCESSING.`
          );
          await prisma.meeting.update({
            where: { id: meeting.id },
            data: { status: "PROCESSING" },
          });
          continue;
        }
      }

      try {
        const hasCallEnded = botData.status_changes?.some(
          (change: any) => change.code === "call_ended"
        );

        if (
          meeting.status === "PROCESSING" &&
          hasCallEnded &&
          (!botData.recordings || botData.recordings.length === 0)
        ) {
          console.error(
            `Bot ${botData.id} for meeting ${meeting.id} finished without creating a recording. Marking as FAILED.`
          );
          await prisma.meeting.update({
            where: { id: meeting.id },
            data: { status: "FAILED" },
          });
          continue;
        }
      } catch (error) {
        console.error(
          "Error checking for call ended without recordings:",
          error
        );
      }

      const recording = botData.recordings?.find(
        (r: any) => r.status?.code === "done"
      );

      if (
        (meeting.status === "PROCESSING" || meeting.status === "SCHEDULED") &&
        recording
      ) {
        console.log(
          `Recording found for bot ${botData.id}. Starting transcription job.`
        );

        await fetch(
          `https://us-west-2.recall.ai/api/v1/recording/${recording.id}/create_transcript/`,
          {
            method: "POST",
            headers: {
              Authorization: `Token ${process.env.RECALL_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              provider: { recallai_async: { language: "en" } },
            }),
          }
        );

        await prisma.meeting.update({
          where: { id: meeting.id },
          data: { status: "TRANSCRIBING" },
        });
      }

      const transcriptInfo = recording?.media_shortcuts?.transcript;

      if (transcriptInfo?.status?.code === "done") {
        console.log(
          `Transcript ready for bot: ${botData.id}. Downloading and updating database.`
        );

        const transcriptDownloadUrl = transcriptInfo.data.download_url;
        const transcriptResponse = await fetch(transcriptDownloadUrl);
        const transcriptData = await transcriptResponse.json();

        await prisma.meeting.update({
          where: { id: meeting.id },
          data: {
            transcript: JSON.stringify(transcriptData),
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
