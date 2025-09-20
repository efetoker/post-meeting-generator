// app/(protected)/upcoming-meetings/page.tsx

"use client";

import { useEffect, useState } from "react";
import { CalendarEvent } from "@/types/calendar";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { ErrorState } from "./components/ErrorState";
import { EmptyState } from "./components/EmptyState";
import { MeetingGroup } from "./components/MeetingGroup";

export interface EnrichedCalendarEvent extends CalendarEvent {
  isRecordingEnabled: boolean;
  sourceAccountId: string;
  sourceAccountEmail: string | null;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<EnrichedCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/dashboard-events");
        if (!response.ok) {
          throw new Error("Failed to fetch calendar events.");
        }
        const data = await response.json();

        const now = new Date();
        const upcomingEvents = data.filter((event: EnrichedCalendarEvent) => {
          const eventEndTime = new Date(event.end.dateTime || event.end.date!);
          return eventEndTime > now;
        });

        setEvents(upcomingEvents);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleToggleChange = async (
    event: CalendarEvent,
    isChecked: boolean,
    meetingInfo: { link: string; platform: string } | null
  ) => {
    if (!meetingInfo) return;

    if (isChecked) {
      if (!meetingInfo) return;
      try {
        await fetch("/api/meetings/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event, isEnabled: true, ...meetingInfo }),
        });
        // TODO: Add success feedback to the user
      } catch (error) {
        console.error("Failed to enable recording:", error);
        // TODO: Add error feedback to the user
      }
    } else {
      try {
        await fetch("/api/meetings/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ googleEventId: event.id }),
        });
        // TODO: Add success feedback to the user
      } catch (error) {
        console.error("Failed to cancel recording:", error);
        // TODO: Add error feedback to the user
      }
    }
  };

  const groupEventsByDate = (events: EnrichedCalendarEvent[]) => {
    const grouped = new Map<string, EnrichedCalendarEvent[]>();
    const now = new Date();
    const currentYear = now.getFullYear();
    const today = now.toLocaleDateString();
    const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString();

    events.forEach((event) => {
      const eventDate = new Date(event.start.dateTime || event.start.date!);
      const eventDateString = eventDate.toLocaleDateString();

      const formattingOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "long",
        day: "numeric",
      };

      if (eventDate.getFullYear() !== currentYear) {
        formattingOptions.year = "numeric";
      }

      let dayLabel = eventDate.toLocaleDateString(undefined, formattingOptions);

      if (eventDateString === today) {
        dayLabel = "Today";
      } else if (eventDateString === tomorrow) {
        dayLabel = "Tomorrow";
      }

      if (!grouped.has(dayLabel)) {
        grouped.set(dayLabel, []);
      }
      grouped.get(dayLabel)!.push(event);
    });
    return grouped;
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (events.length === 0) {
    return <EmptyState />;
  }

  const groupedEvents = groupEventsByDate(events);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Meetings</h1>
      <div className="space-y-8">
        {Array.from(groupedEvents.entries()).map(([date, dateEvents]) => (
          <MeetingGroup
            key={date}
            date={date}
            events={dateEvents}
            onToggleChange={handleToggleChange}
          />
        ))}
      </div>
    </div>
  );
}
