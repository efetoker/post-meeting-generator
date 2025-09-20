// app/meetings/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Meeting } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatTranscript } from "@/lib/utils";
import { GeneratedEmail } from "./components/GeneratedEmail";
import { GeneratedSocialPosts } from "./components/GeneratedSocialPosts";

export default function MeetingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchMeeting = async () => {
      try {
        const response = await fetch(`/api/meetings/${id}`);
        if (!response.ok) throw new Error("Meeting not found.");
        const data = await response.json();
        setMeeting(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  if (isLoading) {
    // TODO: Better loading
    return <div className="p-8">Loading meeting details...</div>;
  }

  if (!meeting) {
    return <div className="p-8">Meeting not found.</div>;
  }

  const cleanTranscript = formatTranscript(meeting.transcript as string | null);

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{meeting.title}</h1>
        <p className="text-muted-foreground mt-1">
          {new Date(meeting.startTime).toLocaleString()}
        </p>
      </div>

      <Card className="mb-8 bg-muted/20">
        <CardHeader>
          <CardTitle>AI Toolkit</CardTitle>
          <CardDescription>
            Generate content from this meeting&#39;s transcript.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GeneratedEmail transcript={cleanTranscript} />
          <GeneratedSocialPosts meetingId={id} transcript={cleanTranscript} />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Full Transcript</h2>
        <Card>
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
              {cleanTranscript}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
