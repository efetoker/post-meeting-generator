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
    const fetchInitialData = async () => {
      try {
        const [automationsRes, postsRes] = await Promise.all([
          fetch("/api/automations"),
          fetch(`/api/meetings/${meetingId}/posts`),
        ]);

        const automationsData = await automationsRes.json();
        setAutomations(automationsData);

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setGeneratedPosts(postsData);
        }
      } catch (error) {
        console.error(
          "Failed to load initial data for social posts component",
          error
        );
      }
    };
    fetchInitialData();
  }, [meetingId]);

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

  const handlePost = async (post: SocialPost) => {
    setIsPosting(post.id);
    setPostStatus((prev) => ({ ...prev, [post.id]: "Posting..." }));
    try {
      let endpoint = "";
      if (post.platform.toLowerCase() === "linkedin") {
        endpoint = "/api/post/linkedin";
      } else if (post.platform.toLowerCase() === "facebook") {
        endpoint = "/api/post/facebook";
      } else {
        throw new Error("Posting to this platform is not supported.");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: post.content, postId: post.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post.");
      }

      setPostStatus((prev) => ({ ...prev, [post.id]: "Posted successfully!" }));
      setGeneratedPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === post.id ? { ...p, status: "PUBLISHED" } : p
        )
      );
    } catch (error: any) {
      setPostStatus((prev) => ({ ...prev, [post.id]: error.message }));
      console.error("Failed to post:", error);
    } finally {
      setIsPosting(null);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await fetch(`/api/post/${postId}`, {
        method: "DELETE",
      });
      setGeneratedPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Failed to delete post:", error);
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
              {post.status === "DRAFT" ? "Draft" : "Published"} {post.platform}{" "}
              Post
            </h2>
            <Card>
              <CardContent className="p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {post.content}
                </pre>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex gap-2">
                  {post.status === "DRAFT" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(post.content)}
                  >
                    Copy
                  </Button>
                  {post.status === "DRAFT" && (
                    <Button
                      onClick={() => handlePost(post)}
                      disabled={isPosting === post.id}
                    >
                      {isPosting === post.id
                        ? "Posting..."
                        : `Post to ${post.platform}`}
                    </Button>
                  )}
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
