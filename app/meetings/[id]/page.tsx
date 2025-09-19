// app/meetings/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Meeting } from "@prisma/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatTranscript } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function MeetingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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

  const cleanTranscript = formatTranscript(
    meeting?.transcript as string | null
  );

  const handleGenerateEmail = async () => {
    setIsGenerating(true);
    setGeneratedEmail("");
    try {
      const response = await fetch("/api/generate/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: cleanTranscript }),
      });
      const data = await response.json();
      setGeneratedEmail(data.email);
    } catch (error) {
      console.error("Failed to generate email", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading meeting details...</div>;
  }

  if (!meeting) {
    return <div className="p-8">Meeting not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 grid md:grid-cols-2 gap-8">
      {/* Transcript Column */}
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{meeting.title}</h1>
          <p className="text-muted-foreground">
            {new Date(meeting.startTime).toLocaleString()}
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Meeting Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {cleanTranscript}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* AI Content Column */}
      <div>
        <div className="space-y-4">
          <Button onClick={handleGenerateEmail} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Follow-up Email"}
          </Button>
          {generatedEmail && (
            <Card>
              <CardHeader>
                <CardTitle>Draft Follow-up Email</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {generatedEmail}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
