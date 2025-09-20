// app/api/dashboard-events/route.ts

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
    const googleAccounts = await prisma.account.findMany({
      where: { userId: session.user.id, provider: "google" },
    });

    if (googleAccounts.length === 0) return NextResponse.json([]);

    const allEvents: any[] = [];

    for (const account of googleAccounts) {
      let accessToken = account.access_token;

      if (
        account.expires_at &&
        account.expires_at * 1000 < Date.now() - 60000
      ) {
        console.log(
          `Token for account ${account.providerAccountId} expired. Refreshing...`
        );

        try {
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              refresh_token: account.refresh_token!,
              grant_type: "refresh_token",
            }),
          });

          const newTokens = await response.json();
          if (!response.ok) throw new Error(newTokens.error_description);

          await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: account.providerAccountId,
              },
            },
            data: {
              access_token: newTokens.access_token,
              expires_at: Math.floor(Date.now() / 1000) + newTokens.expires_in,
            },
          });

          accessToken = newTokens.access_token;
        } catch (error) {
          console.error(
            `Failed to refresh token for account ${account.providerAccountId}`,
            error
          );
          continue;
        }
      }

      if (!accessToken) continue;

      const calendarApiUrl = new URL(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events"
      );
      calendarApiUrl.searchParams.set("timeMin", new Date().toISOString());
      calendarApiUrl.searchParams.set("maxResults", "10");
      calendarApiUrl.searchParams.set("singleEvents", "true");
      calendarApiUrl.searchParams.set("orderBy", "startTime");

      const calendarResponse = await fetch(calendarApiUrl.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (calendarResponse.ok) {
        const data = await calendarResponse.json();
        if (data.items) {
          const eventsWithAccount = data.items.map((event: any) => ({
            ...event,
            sourceAccountId: account.providerAccountId,
            sourceAccountEmail: account.email,
          }));
          allEvents.push(...eventsWithAccount);
        }
      } else {
        console.error(
          `Failed to fetch calendar for account ${account.providerAccountId}`,
          await calendarResponse.json()
        );
      }
    }

    allEvents.sort(
      (a, b) =>
        new Date(a.start.dateTime || a.start.date).getTime() -
        new Date(b.start.dateTime || b.start.date).getTime()
    );

    const eventIds = allEvents.map((event: any) => event.id);

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

    const enrichedEvents = allEvents.map((event: any) => ({
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
