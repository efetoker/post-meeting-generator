// app/past-meetings/[id]/components/GeneratedSocialPosts.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Automation, SocialPost } from "@prisma/client";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { PostGeneratorForm } from "./PostGeneratorForm";

interface GeneratedSocialPostsProps {
  meetingId: string;
  transcript: string;
  automations: Automation[];
  setAutomations: (automations: Automation[]) => void;
  generatedPosts: SocialPost[];
  setGeneratedPosts: React.Dispatch<React.SetStateAction<SocialPost[]>>;
}

export function GeneratedSocialPosts({
  meetingId,
  transcript,
  automations,
  generatedPosts,
  setGeneratedPosts,
}: GeneratedSocialPostsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState<string | null>(null);

  const handleGeneratePost = async (automationId: string) => {
    setIsGenerating(true);
    const promise = fetch("/api/generate/social-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        automationId: automationId,
        meetingId,
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate post.");
      }
      return res.json();
    });

    toast
      .promise(promise, {
        loading: "Generating social post...",
        success: (newPost) => {
          setGeneratedPosts((prev) =>
            [...prev, newPost].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
          );
          return "Post generated successfully!";
        },
        error: (err) => err.toString(),
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Post copied to clipboard!");
  };

  const handlePost = async (post: SocialPost) => {
    setIsPosting(post.id);
    let endpoint = "";
    if (post.platform.toLowerCase() === "linkedin") {
      endpoint = "/api/post/linkedin";
    } else if (post.platform.toLowerCase() === "facebook") {
      endpoint = "/api/post/facebook";
    } else {
      toast.error("Posting to this platform is not supported.");
      setIsPosting(null);
      return;
    }

    const promise = fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: post.content, postId: post.id }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to post.");
      }
      return res.json();
    });

    toast
      .promise(promise, {
        loading: "Posting...",
        success: () => {
          setGeneratedPosts((prevPosts) =>
            prevPosts.map((p) =>
              p.id === post.id ? { ...p, status: "PUBLISHED" } : p
            )
          );
          return "Posted successfully!";
        },
        error: (err) => err.toString(),
      })
      .finally(() => {
        setIsPosting(null);
      });
  };

  const handleDelete = async (postId: string) => {
    const promise = fetch(`/api/post/${postId}`, {
      method: "DELETE",
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to delete post.");
    });

    toast.promise(promise, {
      loading: "Deleting post...",
      success: () => {
        setGeneratedPosts((prev) => prev.filter((p) => p.id !== postId));
        return "Post deleted.";
      },
      error: (err) => err.toString(),
    });
  };

  return (
    <div>
      <PostGeneratorForm
        automations={automations}
        onGenerate={handleGeneratePost}
        isGenerating={isGenerating}
      />

      <div className="space-y-6 mt-4">
        {generatedPosts.map((post) => (
          <div key={post.id}>
            <h2 className="text-xl font-bold mb-4">
              <Icon
                icon={
                  post.platform.toLowerCase() === "linkedin"
                    ? "logos:linkedin-icon"
                    : "logos:facebook"
                }
                className="inline-block size-6 mr-2"
              />
              {post.status === "DRAFT" ? "Draft" : "Published"} {post.platform}{" "}
              Post
            </h2>
            <Card>
              <CardContent className="px-6">
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
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
