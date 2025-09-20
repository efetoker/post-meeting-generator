// app/(protected)/settings/components/SocialConnections.tsx

"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Account } from "@prisma/client";
import { Icon } from "@iconify/react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface SocialConnectionsProps {
  connections: Account[];
  handleDisconnect: (provider: string, providerAccountId: string) => void;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

const ConnectionStatus = ({ text, color }: { text: string; color: string }) => (
  <div className="flex items-center gap-2">
    <span className={cn("h-2 w-2 rounded-full", color)}></span>
    <span className="text-sm font-medium text-muted-foreground">{text}</span>
  </div>
);

export function SocialConnections({
  connections,
  handleDisconnect,
}: SocialConnectionsProps) {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [pageSelectionMessage, setPageSelectionMessage] = useState("");
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [accountToDisconnect, setAccountToDisconnect] = useState<{
    provider: string;
    providerAccountId: string;
  } | null>(null);

  const linkedInAccount = connections.find((c) => c.provider === "linkedin");
  const facebookAccount = connections.find((c) => c.provider === "facebook");

  useEffect(() => {
    if (facebookAccount) {
      setIsLoadingPages(true);
      const fetchInitialData = async () => {
        try {
          const [pagesRes, settingsRes] = await Promise.all([
            fetch("/api/connections/facebook-pages"),
            fetch("/api/settings"),
          ]);

          const pagesData = await pagesRes.json();
          if (pagesData && !pagesData.error) setPages(pagesData);

          const settingsData = await settingsRes.json();
          if (settingsData && settingsData.defaultFacebookPageId) {
            setSelectedPageId(settingsData.defaultFacebookPageId);
          }
        } catch (error) {
          setPageSelectionMessage("Failed to load your pages.");
        } finally {
          setIsLoadingPages(false);
        }
      };
      fetchInitialData();
    }
  }, [facebookAccount]);

  const savePageSelection = async (
    pageId: string | null,
    pageAccessToken: string | null
  ) => {
    setPageSelectionMessage("Saving...");
    try {
      const response = await fetch("/api/settings/facebook-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, pageAccessToken }),
      });
      if (!response.ok) throw new Error("Save failed");

      setSelectedPageId(pageId);
      setPageSelectionMessage(
        pageId ? "Default page saved." : "Default page cleared."
      );
    } catch (error) {
      setPageSelectionMessage("An error occurred.");
    }
    setTimeout(() => setPageSelectionMessage(""), 2000);
  };

  const handlePageSelect = (pageId: string) => {
    const selectedPage = pages.find((p) => p.id === pageId);
    if (selectedPage) {
      savePageSelection(selectedPage.id, selectedPage.access_token);
    }
  };

  const openConfirmationDialog = (
    provider: string,
    providerAccountId: string
  ) => {
    setAccountToDisconnect({ provider, providerAccountId });
    setDialogOpen(true);
  };

  const confirmDisconnect = () => {
    if (accountToDisconnect) {
      handleDisconnect(
        accountToDisconnect.provider,
        accountToDisconnect.providerAccountId
      );
    }
    setDialogOpen(false);
    setAccountToDisconnect(null);
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Social Media Connections</CardTitle>
        <CardDescription>
          Connect your social media accounts to post content directly.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon icon="logos:linkedin-icon" className="h-6 w-6" />
              <span className="text-lg font-semibold">LinkedIn</span>
            </div>
            {linkedInAccount ? (
              <div className="flex items-center gap-4">
                <ConnectionStatus text="Connected" color="bg-green-500" />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    openConfirmationDialog(
                      "linkedin",
                      linkedInAccount.providerAccountId
                    )
                  }
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={() => signIn("linkedin")}>Connect</Button>
            )}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon icon="logos:facebook" className="h-6 w-6" />
              <span className="text-lg font-semibold">Facebook</span>
            </div>
            {facebookAccount ? (
              <div className="flex items-center gap-4">
                <ConnectionStatus text="Connected" color="bg-green-500" />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    openConfirmationDialog(
                      "facebook",
                      facebookAccount.providerAccountId
                    )
                  }
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={() => signIn("facebook")}>Connect</Button>
            )}
          </div>

          {facebookAccount && (
            <div className="mt-4 border-t pt-4">
              <label className="text-sm font-medium block mb-2">
                Default Page for Posts
              </label>
              {isLoadingPages ? (
                <p className="text-sm text-muted-foreground">
                  Loading pages...
                </p>
              ) : (
                <div className="max-w-sm">
                  <Select
                    onValueChange={handlePageSelect}
                    value={selectedPageId || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Facebook Page..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pages.map((page) => (
                        <SelectItem key={page.id} value={page.id}>
                          {page.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {pageSelectionMessage && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {pageSelectionMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will disconnect your{" "}
            <strong className="capitalize text-foreground">
              {accountToDisconnect?.provider}
            </strong>{" "}
            account. You will need to reconnect it to post content.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDisconnect}
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            Disconnect
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
