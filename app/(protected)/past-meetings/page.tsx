// app/past-meetings/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Meeting } from "@prisma/client";
import { Icon } from "@iconify/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AttendeeAvatars } from "../upcoming-meetings/components/AttendeeAvatars";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { EmptyState } from "./components/EmptyState";

const PlatformIcon = ({
  platform,
  className,
}: {
  platform: string | null;
  className: string;
}) => {
  let iconName = "";
  if (platform?.includes("Google Meet")) iconName = "logos:google-meet";
  else if (platform?.includes("Zoom")) iconName = "logos:zoom";
  else if (platform?.includes("Microsoft Teams"))
    iconName = "logos:microsoft-teams";

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
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setMeetings(data);
      } catch (error) {
        console.error("Failed to load past meetings:", error);
        toast.error("Failed to load past meetings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Past Meetings</h1>
          <p className="text-muted-foreground mt-2">
            Review transcripts and generate content from your completed
            meetings.
          </p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Past Meetings</h1>
        <p className="text-muted-foreground mt-2">
          Review transcripts and generate content from your completed meetings.
        </p>
      </div>

      {meetings.length > 0 ? (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Link
              href={`/past-meetings/${meeting.id}`}
              key={meeting.id}
              className="group block"
            >
              <Card className="hover:border-primary/50 cursor-pointer transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="group-hover:text-primary transition-colors mb-2">
                        {meeting.title}
                      </CardTitle>
                      <CardDescription>
                        {new Date(meeting.startTime).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <PlatformIcon
                        platform={meeting.platform}
                        className="h-6 w-6"
                      />
                      <Icon
                        icon="lucide:arrow-right"
                        className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="text-sm font-semibold mb-2">Attendees:</h4>
                  <AttendeeAvatars attendees={meeting.attendees as any[]} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
