// app/meetings/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Meeting } from "@prisma/client";
import { Icon } from "@iconify/react";

interface Attendee {
  email: string;
}

const PlatformIcon = ({
  platform,
  className,
}: {
  platform: string | null;
  className: string;
}) => {
  let iconName = "";
  if (platform?.includes("Google Meet")) iconName = "logos:google-meet";
  if (platform?.includes("Zoom")) iconName = "logos:zoom";
  if (platform?.includes("Microsoft Teams")) iconName = "logos:microsoft-teams";

  if (iconName) {
    return <Icon icon={iconName} className={className} />;
  }
  return null;
};

export default function PastMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch("/api/meetings");
        const data = await response.json();
        setMeetings(data);
      } catch (error) {
        console.error("Failed to load past meetings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  if (isLoading) {
    // TODO: Better loading
    return <div className="p-8">Loading past meetings...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Past Meetings</h1>
        <p className="text-muted-foreground">
          Review transcripts and generate content from your completed meetings.
        </p>
      </div>
      <div className="space-y-4">
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <Link href={`/meetings/${meeting.id}`} key={meeting.id}>
              <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{meeting.title}</CardTitle>
                      <CardDescription>
                        {new Date(meeting.startTime).toLocaleString()}
                      </CardDescription>
                    </div>
                    <PlatformIcon
                      platform={meeting.platform}
                      className="h-6 w-6"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h4 className="text-sm font-semibold mb-2">Attendees:</h4>
                  <div className="flex flex-wrap gap-2">
                    {meeting.attendees &&
                    (meeting.attendees as unknown as Attendee[]).length > 0 ? (
                      (meeting.attendees as unknown as Attendee[]).map(
                        (attendee) => (
                          <div
                            key={attendee.email}
                            className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-1"
                          >
                            {attendee.email}
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No attendees listed.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <p>No completed meetings with transcripts found.</p>
        )}
      </div>
    </div>
  );
}
