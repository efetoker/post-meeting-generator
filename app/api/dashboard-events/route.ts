// app/api/dashboard-events/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const googleAccount = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" },
    });

    if (!googleAccount?.access_token) {
      return NextResponse.json(
        { error: "Google account not connected." },
        { status: 404 }
      );
    }

    const calendarApiUrl = new URL(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    );
    calendarApiUrl.searchParams.set("timeMin", new Date().toISOString());
    calendarApiUrl.searchParams.set("maxResults", "10");
    calendarApiUrl.searchParams.set("singleEvents", "true");
    calendarApiUrl.searchParams.set("orderBy", "startTime");

    const response = await fetch(calendarApiUrl.toString(), {
      headers: { Authorization: `Bearer ${googleAccount.access_token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch calendar events from Google.");
    }

    const googleEvents = await response.json();
    const eventIds = googleEvents.items.map((event: any) => event.id);

    const ourMeetings = await prisma.meeting.findMany({
      where: {
        googleEventId: { in: eventIds },
        userId: session.user.id,
      },
      select: {
        googleEventId: true,
        recordingEnabled: true,
      },
    });

    const recordingStatusMap = new Map(
      ourMeetings.map((m) => [m.googleEventId, m.recordingEnabled])
    );

    const enrichedEvents = googleEvents.items.map((event: any) => ({
      ...event,
      isRecordingEnabled: recordingStatusMap.get(event.id) || false,
    }));

    return NextResponse.json(enrichedEvents);
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
