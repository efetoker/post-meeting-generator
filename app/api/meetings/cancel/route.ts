// app/api/meetings/cancel/route.ts

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
    const { googleEventId } = await request.json();

    const meeting = await prisma.meeting.findUnique({
      where: { googleEventId: googleEventId },
      select: { recallBotId: true },
    });

    if (meeting?.recallBotId) {
      const botId = meeting.recallBotId;

      const deleteResponse = await fetch(
        `https://us-west-2.recall.ai/api/v1/bot/${botId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${process.env.RECALL_AI_KEY}`,
          },
        }
      );

      if (!deleteResponse.ok) {
        console.error(
          `Failed to delete bot ${botId} from Recall.ai`,
          await deleteResponse.text()
        );
      }
    }

    await prisma.meeting.update({
      where: { googleEventId: googleEventId },
      data: {
        recordingEnabled: false,
        recallBotId: null,
      },
    });

    return NextResponse.json({ success: true, message: "Recording canceled." });
  } catch (error) {
    console.error("Error canceling recording:", error);
    return NextResponse.json(
      { error: "Failed to cancel recording." },
      { status: 500 }
    );
  }
}
