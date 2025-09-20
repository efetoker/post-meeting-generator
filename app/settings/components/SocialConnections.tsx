// app/settings/components/SocialConnections.tsx

"use client";

import { Button } from "@/components/ui/button";
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
import { Icon } from "@iconify/react";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Account } from "@prisma/client";

interface SocialConnectionsProps {
  connections: Account[];
  handleDisconnect: (provider: string, providerAccountId: string) => void;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

export function SocialConnections({
  connections,
  handleDisconnect,
}: SocialConnectionsProps) {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [pageSelectionMessage, setPageSelectionMessage] = useState("");
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

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
  };

  const handleClearSelection = () => {
    savePageSelection(null, null);
  };

  const handlePageSelect = (pageId: string) => {
    const selectedPage = pages.find((p) => p.id === pageId);
    if (selectedPage) {
      savePageSelection(selectedPage.id, selectedPage.access_token);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Social Media Connections</CardTitle>
        <CardDescription>
          Connect your social media accounts to post content directly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2 border rounded-md">
            <span>LinkedIn</span>
            {linkedInAccount ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-600">Connected</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDisconnect(
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

          <div className="flex items-center justify-between p-2 border rounded-md">
            <span>Facebook</span>
            {facebookAccount ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-600">Connected</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDisconnect(
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
            <div className="pt-2 pl-2">
              <label className="text-sm font-medium block mb-2">
                Default Page to Post To
              </label>
              {isLoadingPages ? (
                <p className="text-sm text-muted-foreground">
                  Loading pages...
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={handlePageSelect}
                      value={selectedPageId || ""}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a page..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedPageId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClearSelection}
                      >
                        <Icon icon="lucide:x" className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {pageSelectionMessage && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {pageSelectionMessage}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
