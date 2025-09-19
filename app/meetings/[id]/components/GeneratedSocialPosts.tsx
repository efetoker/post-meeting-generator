// app/meetings/[id]/components/GeneratedSocialPosts.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Automation, SocialPost } from "@prisma/client";
import { Label } from "@/components/ui/label";

interface GeneratedSocialPostsProps {
  meetingId: string;
  transcript: string;
}

export function GeneratedSocialPosts({
  meetingId,
  transcript,
}: GeneratedSocialPostsProps) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [selectedAutomationId, setSelectedAutomationId] = useState<
    string | null
  >(null);
  const [generatedPosts, setGeneratedPosts] = useState<SocialPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPosting, setIsPosting] = useState<string | null>(null);
  const [postStatus, setPostStatus] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchAutomations = async () => {
      const response = await fetch("/api/automations");
      const data = await response.json();
      setAutomations(data);
    };
    fetchAutomations();
  }, []);

  const handleGeneratePost = async () => {
    if (!selectedAutomationId) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate/social-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          automationId: selectedAutomationId,
          meetingId,
        }),
      });
      const newPost = await response.json();
      setGeneratedPosts((prev) => [...prev, newPost]);
    } catch (error) {
      console.error("Failed to generate post", error);
    } finally {
      setIsGenerating(false);
      setIsDialogOpen(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handlePost = async (
    postId: string,
    content: string,
    platform: string
  ) => {
    setIsPosting(postId);
    setPostStatus((prev) => ({ ...prev, [postId]: "Posting..." }));
    try {
      if (platform.toLowerCase() !== "linkedin") {
        throw new Error("Only LinkedIn posting is currently supported.");
      }

      const response = await fetch("/api/post/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to post.");

      setPostStatus((prev) => ({ ...prev, [postId]: "Posted successfully!" }));
    } catch (error: any) {
      setPostStatus((prev) => ({ ...prev, [postId]: error.message }));
      console.error("Failed to post:", error);
    } finally {
      setIsPosting(null);
    }
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Generate Social Media Post</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate a post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label>Select an Automation</Label>
            <Select onValueChange={setSelectedAutomationId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an automation..." />
              </SelectTrigger>
              <SelectContent>
                {automations.map((auto) => (
                  <SelectItem key={auto.id} value={auto.id}>
                    {auto.name} ({auto.platform})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleGeneratePost}
              disabled={isGenerating || !selectedAutomationId}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6 mt-4">
        {generatedPosts.map((post) => (
          <div key={post.id}>
            <h2 className="text-2xl font-bold mb-4">
              Draft {post.platform} Post
            </h2>
            <Card>
              <CardContent className="p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {post.content}
                </pre>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(post.content)}
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={() =>
                      handlePost(post.id, post.content, post.platform)
                    }
                    disabled={isPosting === post.id}
                  >
                    {isPosting === post.id
                      ? "Posting..."
                      : `Post to ${post.platform}`}
                  </Button>
                </div>
                {postStatus[post.id] && (
                  <p className="text-sm text-muted-foreground">
                    {postStatus[post.id]}
                  </p>
                )}
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
