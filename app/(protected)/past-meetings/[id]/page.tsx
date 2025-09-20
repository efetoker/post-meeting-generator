// app/past-meetings/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Meeting, Automation, SocialPost } from "@prisma/client";
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

const PlatformIcon = ({ platform }: { platform: string }) => {
  let iconName = "";
  if (platform?.includes("Google Meet")) iconName = "logos:google-meet";
  else if (platform?.includes("Zoom")) iconName = "logos:zoom";
  else if (platform?.includes("Microsoft Teams"))
    iconName = "logos:microsoft-teams";

  if (!iconName) return null;
  return <Icon icon={iconName} className="h-6 w-6" />;
};

export default function MeetingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<SocialPost[]>([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchPageData = async () => {
      try {
        try {
          await fetch(`/api/meetings/${id}/posts/draft`, {
            method: "DELETE",
          });
        } catch (error) {}

        const [meetingRes, automationsRes, postsRes] = await Promise.all([
          fetch(`/api/meetings/${id}`),
          fetch("/api/automations"),
          fetch(`/api/meetings/${id}/posts`),
        ]);

        if (!meetingRes.ok) throw new Error("Meeting not found.");
        const meetingData = await meetingRes.json();
        setMeeting(meetingData);

        if (!automationsRes.ok) throw new Error("Failed to load automations.");
        const automationsData = await automationsRes.json();
        setAutomations(automationsData);

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setGeneratedPosts(postsData);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load page data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [id, refetchTrigger]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/3" />
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Skeleton className="h-12 w-48 mb-4" />
              <Skeleton className="h-46 w-full" />
            </CardContent>
          </Card>
        </div>
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
        <div className="flex items-center gap-4">
          <PlatformIcon platform={meeting.platform} />
          <h1 className="text-3xl font-bold">{meeting.title}</h1>
        </div>
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
                <GeneratedEmail
                  transcript={cleanTranscript}
                  generatedEmail={generatedEmail}
                  setGeneratedEmail={setGeneratedEmail}
                  isGenerating={isGeneratingEmail}
                  setIsGenerating={setIsGeneratingEmail}
                />
              </TabsContent>
              <TabsContent value="social-post">
                <GeneratedSocialPosts
                  meetingId={id}
                  transcript={cleanTranscript}
                  automations={automations}
                  generatedPosts={generatedPosts}
                  setGeneratedPosts={setGeneratedPosts}
                  setRefetchTrigger={setRefetchTrigger}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
