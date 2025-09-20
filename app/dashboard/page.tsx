// app/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getMeetingInfo } from "@/lib/utils";
import { CalendarEvent } from "@/types/calendar";

interface EnrichedCalendarEvent extends CalendarEvent {
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

  const formatDateTime = (dateTime?: string, date?: string) => {
    if (dateTime) {
      return new Date(dateTime).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
    if (date) {
      return new Date(date).toLocaleString(undefined, {
        dateStyle: "medium",
      });
    }
    return "No time specified";
  };

  if (isLoading) {
    return <div className="p-8">Loading upcoming meetings...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Meetings</h1>
      <div className="space-y-4">
        {events.length > 0 ? (
          events.map((event) => {
            const meetingInfo = getMeetingInfo(event);
            const isRecordable = !!meetingInfo;

            return (
              <Card
                key={event.id}
                className={!isRecordable ? "bg-muted/50" : ""}
              >
                <CardHeader>
                  <CardTitle>{event.summary || "No Title"}</CardTitle>
                  <CardDescription>
                    {formatDateTime(event.start.dateTime, event.start.date)}

                    <span className="block mt-1 text-xs text-muted-foreground">
                      From Calendar:{" "}
                      {event.sourceAccountEmail ||
                        `...${event.sourceAccountId.slice(-6)}`}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold mb-2">Attendees:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {event.attendees ? (
                        event.attendees.map((attendee) => (
                          <li key={attendee.email}>{attendee.email}</li>
                        ))
                      ) : (
                        <li>Just you</li>
                      )}
                    </ul>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`record-${event.id}`}
                      disabled={!isRecordable}
                      defaultChecked={event.isRecordingEnabled}
                      onCheckedChange={(isChecked) =>
                        handleToggleChange(event, isChecked, meetingInfo)
                      }
                    />
                    <Label
                      htmlFor={`record-${event.id}`}
                      className={!isRecordable ? "text-gray-400" : ""}
                    >
                      {isRecordable
                        ? "Record meeting"
                        : "No meeting link found"}
                    </Label>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p>No upcoming meetings found.</p>
        )}
      </div>
    </div>
  );
}
