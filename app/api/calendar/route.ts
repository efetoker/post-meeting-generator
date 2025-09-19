// app/api/calendar/route.ts

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
      where: {
        userId: session.user.id,
        provider: "google",
      },
    });

    if (!googleAccount?.access_token) {
      return NextResponse.json(
        { error: "Google account not connected or access token missing." },
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
      headers: {
        Authorization: `Bearer ${googleAccount.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Calendar API Error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch calendar events from Google." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data.items);
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
