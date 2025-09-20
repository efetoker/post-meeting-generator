// app/(protected)/upcoming-meetings/page.tsx

"use client";

import { useEffect, useState } from "react";
import { CalendarEvent } from "@/types/calendar";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { ErrorState } from "./components/ErrorState";
import { EmptyState } from "./components/EmptyState";
import { MeetingGroup } from "./components/MeetingGroup";
import { getMeetingInfo } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

export interface EnrichedCalendarEvent extends CalendarEvent {
  isRecordingEnabled: boolean;
  sourceAccountId: string;
  sourceAccountEmail: string | null;
  status: string;
}

export default function UpcomingMeetingsPage() {
  const [events, setEvents] = useState<EnrichedCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOperating, setIsOperating] = useState(false);
  const [showAccountEmail, setShowAccountEmail] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchEvents = async (pageToken: string | null = null) => {
    try {
      const url = pageToken
        ? `/api/dashboard-events?pageToken=${pageToken}`
        : "/api/dashboard-events";
      const [eventsRes, connectionsRes] = await Promise.all([
        fetch(url),
        fetch("/api/connections"),
      ]);

      if (!eventsRes.ok) throw new Error("Failed to fetch calendar events.");
      if (!connectionsRes.ok) throw new Error("Failed to fetch connections.");

      const eventsData = await eventsRes.json();
      const connectionsData = await connectionsRes.json();

      const googleAccounts = connectionsData.filter(
        (acc: { provider: string }) => acc.provider === "google"
      );
      const hasMultipleAccounts = googleAccounts.length > 1;
      setShowAccountEmail(hasMultipleAccounts);

      const now = new Date();
      const upcomingEvents = eventsData.events.filter(
        (event: EnrichedCalendarEvent) => {
          const eventEndTime = new Date(event.end.dateTime || event.end.date!);
          return eventEndTime > now && event.status !== "COMPLETED";
        }
      );

      upcomingEvents.sort(
        (a: any, b: any) =>
          new Date(a.start.dateTime || a.start.date).getTime() -
          new Date(b.start.dateTime || b.start.date).getTime()
      );

      if (pageToken) {
        setEvents((prevEvents) => [...prevEvents, ...upcomingEvents]);
      } else {
        setEvents(upcomingEvents);
      }
      setNextPageToken(eventsData.nextPageToken);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      try {
        await fetch("/api/cron/poll");
      } catch (error) {}
      await fetchEvents();
    };
    initFetch();
  }, []);

  const handleLoadMore = async () => {
    if (nextPageToken) {
      setIsFetchingMore(true);
      await fetchEvents(nextPageToken);
    }
  };

  const handleToggleChange = async (
    event: EnrichedCalendarEvent,
    isChecked: boolean
  ) => {
    const meetingInfo = getMeetingInfo(event);

    if (!meetingInfo && isChecked) {
      toast.error("No recordable meeting link found.");
      return;
    }

    setIsOperating(true);

    const originalEvents = events;
    setEvents((currentEvents) =>
      currentEvents.map((e) =>
        e.id === event.id ? { ...e, isRecordingEnabled: isChecked } : e
      )
    );

    const apiEndpoint = isChecked
      ? "/api/meetings/toggle"
      : "/api/meetings/cancel";
    const body = isChecked
      ? { event, isEnabled: true, ...meetingInfo }
      : { googleEventId: event.id };

    const promise = fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => {
      if (!res.ok) {
        throw new Error("Action failed. Please try again.");
      }
      return res.json();
    });

    toast
      .promise(promise, {
        loading: isChecked ? "Enabling recording..." : "Disabling recording...",
        success: `Recording ${
          isChecked ? "enabled" : "disabled"
        } successfully!`,
        error: (err) => {
          setEvents(originalEvents);
          return err.toString();
        },
      })
      .finally(() => {
        setIsOperating(false);
      });
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Upcoming Meetings</h1>
        <p className="text-muted-foreground">
          View your upcoming calendar events and manage recording settings.
        </p>
      </div>
      <div className="space-y-8">
        {Array.from(groupedEvents.entries()).map(([date, dateEvents]) => (
          <MeetingGroup
            key={date}
            date={date}
            events={dateEvents}
            onToggleChange={handleToggleChange}
            isOperating={isOperating}
            showAccountEmail={showAccountEmail}
          />
        ))}
      </div>
      {nextPageToken && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isFetchingMore}
          >
            {isFetchingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
