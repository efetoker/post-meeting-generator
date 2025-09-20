// app/past-meetings/[id]/page.tsx

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
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@iconify/react";

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
        toast.error("Failed to load meeting details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/3" />
        </div>
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-48 mb-4" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
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

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Full Transcript</CardTitle>
            <CardDescription>
              The complete, AI-generated transcript from your meeting.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
              {cleanTranscript}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Toolkit</CardTitle>
            <CardDescription>
              Generate content from this meeting&#39;s transcript.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="email">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">
                  <Icon icon="lucide:mail" className="size-4 mr-2" />
                  Follow-up Email
                </TabsTrigger>
                <TabsTrigger value="social-post">
                  <Icon icon="lucide:megaphone" className="size-4 mr-2" />
                  Social Posts
                </TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <GeneratedEmail transcript={cleanTranscript} />
              </TabsContent>
              <TabsContent value="social-post">
                <GeneratedSocialPosts
                  meetingId={id}
                  transcript={cleanTranscript}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
