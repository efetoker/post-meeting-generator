// app/past-meetings/[id]/components/GeneratedSocialPosts.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Automation, SocialPost } from "@prisma/client";
import toast from "react-hot-toast";
import { PostGeneratorForm } from "./PostGeneratorForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { SocialPostCard } from "./SocialPostCard";
import { Icon } from "@iconify/react";
import { Separator } from "@/components/ui/separator";

interface GeneratedSocialPostsProps {
  meetingId: string;
  transcript: string;
  automations: Automation[];
  generatedPosts: SocialPost[];
  setGeneratedPosts: React.Dispatch<React.SetStateAction<SocialPost[]>>;
  setRefetchTrigger: React.Dispatch<React.SetStateAction<number>>;
}

export function GeneratedSocialPosts({
  meetingId,
  transcript,
  automations,
  generatedPosts,
  setGeneratedPosts,
  setRefetchTrigger,
}: GeneratedSocialPostsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [generatedPostInDialog, setGeneratedPostInDialog] =
    useState<SocialPost | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [editableContent, setEditableContent] = useState("");

  const handleGeneratePost = async (automationId: string) => {
    setIsGenerating(true);
    setIsPostDialogOpen(true);
    setGeneratedPostInDialog(null);
    setEditableContent("");

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
          setGeneratedPostInDialog(newPost);
          setEditableContent(newPost.content);
          return "Post generated successfully!";
        },
        error: (err) => err.toString(),
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };

  const handlePost = async (post: SocialPost) => {
    if (!editableContent || !post.id) {
      toast.error("No content to post.");
      return;
    }

    setIsPosting(post.id);

    try {
      const updateResponse = await fetch(`/api/post/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editableContent }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || "Failed to save edited post.");
      }

      let endpoint = "";
      if (post.platform.toLowerCase() === "linkedin") {
        endpoint = "/api/post/linkedin";
      } else if (post.platform.toLowerCase() === "facebook") {
        endpoint = "/api/post/facebook";
      } else {
        throw new Error("Posting to this platform is not supported.");
      }

      const postResponse = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editableContent, postId: post.id }),
      });

      if (!postResponse.ok) {
        const errorData = await postResponse.json();
        throw new Error(errorData.error || "Failed to post.");
      }

      toast.success("Posted successfully!");
      setIsPostDialogOpen(false);
      setRefetchTrigger((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsPosting(null);
    }
  };

  const handleDelete = async (postId: string) => {
    setIsDeleting(postId);
    const promise = fetch(`/api/post/${postId}`, {
      method: "DELETE",
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to delete post.");
    });

    toast
      .promise(promise, {
        loading: "Deleting post...",
        success: () => {
          setRefetchTrigger((prev) => prev + 1);
          return "Post deleted.";
        },
        error: (err) => err.toString(),
      })
      .finally(() => {
        setIsDeleting(null);
      });
  };

  return (
    <div>
      <PostGeneratorForm
        automations={automations}
        onGenerate={handleGeneratePost}
        isGenerating={isGenerating}
      />
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Your Post</DialogTitle>
            <DialogDescription>
              Review and either copy or post the generated content.
            </DialogDescription>
          </DialogHeader>
          {isGenerating ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            generatedPostInDialog && (
              <div className="py-4">
                <Textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  rows={8}
                  disabled={isGenerating || isPosting !== null}
                />
              </div>
            )
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (generatedPostInDialog) {
                  navigator.clipboard.writeText(editableContent || "");
                  toast.success("Post copied to clipboard!");
                }
              }}
              disabled={
                isGenerating || !generatedPostInDialog || isPosting !== null
              }
            >
              <Icon icon="lucide:copy" className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button
              onClick={() =>
                generatedPostInDialog && handlePost(generatedPostInDialog)
              }
              disabled={isGenerating || isPosting === generatedPostInDialog?.id}
            >
              {isPosting === generatedPostInDialog?.id
                ? "Posting..."
                : generatedPostInDialog && generatedPostInDialog.platform
                ? `Post to ${generatedPostInDialog.platform}`
                : "Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Separator className="my-6" />
      <div className="space-y-4">
        {generatedPosts.map((post) => (
          <SocialPostCard
            key={post.id}
            post={post}
            onDelete={handleDelete}
            isOperating={isDeleting === post.id}
          />
        ))}
      </div>
    </div>
  );
}
