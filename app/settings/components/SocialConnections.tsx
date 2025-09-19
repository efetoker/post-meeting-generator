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
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

interface Connection {
  provider: string;
}

interface SocialConnectionsProps {
  connections: Connection[];
  handleDisconnect: (provider: string) => void;
  defaultPageId: string | null;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

export function SocialConnections({
  connections,
  handleDisconnect,
  defaultPageId,
}: SocialConnectionsProps) {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [pageSelectionMessage, setPageSelectionMessage] = useState("");

  const isLinkedInConnected = connections.some(
    (c) => c.provider === "linkedin"
  );
  const isFacebookConnected = connections.some(
    (c) => c.provider === "facebook"
  );

  useEffect(() => {
    if (isFacebookConnected) {
      setIsLoadingPages(true);
      const fetchPages = async () => {
        try {
          const response = await fetch("/api/connections/facebook-pages");
          const data = await response.json();
          if (data && !data.error) setPages(data);
        } catch (error) {
          setPageSelectionMessage("Failed to load your pages.");
        } finally {
          setIsLoadingPages(false);
        }
      };
      fetchPages();
    }
  }, [isFacebookConnected]);

  const handlePageSelect = async (pageId: string) => {
    setPageSelectionMessage("Saving...");
    const selectedPage = pages.find((p) => p.id === pageId);
    if (!selectedPage) return;

    try {
      const response = await fetch("/api/settings/facebook-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: selectedPage.id,
          pageAccessToken: selectedPage.access_token,
        }),
      });
      if (!response.ok) throw new Error();
      setPageSelectionMessage("Success! Default page saved.");
    } catch (error) {
      setPageSelectionMessage("An error occurred.");
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
          {/* LinkedIn Section */}
          <div className="flex items-center justify-between">
            <span>LinkedIn</span>
            {isLinkedInConnected ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-600">Connected</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect("linkedin")}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={() => signIn("linkedin")}>Connect</Button>
            )}
          </div>

          {/* Facebook Section */}
          <div className="flex items-center justify-between">
            <span>Facebook</span>
            {isFacebookConnected ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-600">Connected</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect("facebook")}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={() => signIn("facebook")}>Connect</Button>
            )}
          </div>

          {isFacebookConnected && (
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
                  <Select
                    onValueChange={handlePageSelect}
                    defaultValue={defaultPageId || undefined}
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
