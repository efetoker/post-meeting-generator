// app/past-meetings/[id]/components/SocialPostCard.tsx

"use client";

import { useState } from "react";
import { SocialPost } from "@prisma/client";
import { Icon } from "@iconify/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface SocialPostCardProps {
  post: SocialPost;
  onDelete: (postId: string) => void;
  isOperating: boolean;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  let iconName = "";
  if (platform.toLowerCase() === "linkedin") iconName = "logos:linkedin-icon";
  else if (platform.toLowerCase() === "facebook") iconName = "logos:facebook";
  if (!iconName) return null;
  return <Icon icon={iconName} className="h-5 w-5" />;
};

export function SocialPostCard({
  post,
  onDelete,
  isOperating,
}: SocialPostCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(post.content);
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Card
        className="cursor-pointer transition-colors hover:bg-muted/30 py-0"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <PlatformIcon platform={post.platform} />
          <div className="flex-1">
            <div className="text-sm font-semibold">{post.platform} Post</div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {post.content}
            </p>
          </div>
          <span className="shrink-0 text-sm text-muted-foreground">
            {formattedDate}
          </span>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <PlatformIcon platform={post.platform} />
                <span>{post.platform} Post</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              className="min-h-48"
              value={post.content}
              readOnly
              rows={10}
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-0">
            <div className="flex justify-start gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="w-full sm:w-auto">
                    Remove from Database
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete this post from your
                      database and cannot be undone. Please remember to delete
                      the post from the published platform (e.g., LinkedIn or
                      Facebook) yourself, as this action will only remove it
                      from the database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(post.id)}
                      disabled={isOperating}
                      className={cn(buttonVariants({ variant: "destructive" }))}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCopy}>
                <Icon icon="lucide:copy" className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
