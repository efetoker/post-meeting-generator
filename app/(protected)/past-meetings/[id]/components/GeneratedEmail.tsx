// app/past-meetings/[id]/components/GeneratedEmail.tsx

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface GeneratedEmailProps {
  transcript: string;
}

export function GeneratedEmail({ transcript }: GeneratedEmailProps) {
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (transcript && !generatedEmail && !isGenerating) {
      handleGenerateEmail();
    }
  }, [transcript, isGenerating]);

  const handleGenerateEmail = async () => {
    setIsGenerating(true);
    setGeneratedEmail("");
    const promise = fetch("/api/generate/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate email.");
      }
      return res.json();
    });

    toast
      .promise(promise, {
        loading: "Generating follow-up email...",
        success: (data) => {
          setGeneratedEmail(data.email);
          return "Email generated successfully!";
        },
        error: (err) => {
          console.error("Failed to generate email", err);
          return err.toString();
        },
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEmail);
    toast.success("Email copied to clipboard!");
  };

  if (isGenerating) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="px-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {generatedEmail && (
        <Card className="bg-muted/30">
          <CardContent className="px-6">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {generatedEmail}
            </pre>
          </CardContent>
        </Card>
      )}

      <div className="mt-4 flex gap-2 justify-between">
        <Button variant="outline" onClick={handleCopy}>
          <Icon icon="lucide:copy" className="mr-2 h-4 w-4" />
          Copy
        </Button>
        <Button onClick={handleGenerateEmail}>
          <Icon icon="lucide:refresh-cw" className="mr-2 h-4 w-4" />
          Regenerate
        </Button>
      </div>
    </div>
  );
}
