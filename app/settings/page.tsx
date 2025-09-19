// app/settings/page.tsx

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "next-auth/react";

interface Connection {
  provider: string;
}

export default function SettingsPage() {
  const [offset, setOffset] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    const loadPageData = async () => {
      setIsLoading(true);
      try {
        const [settingsRes, connectionsRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/connections"),
        ]);

        if (!settingsRes.ok) throw new Error("Could not load settings.");
        const settingsData = await settingsRes.json();
        setOffset(settingsData.botJoinOffsetMinutes.toString());

        if (!connectionsRes.ok) throw new Error("Could not load connections.");
        const connectionsData = await connectionsRes.json();
        setConnections(connectionsData);
      } catch (error) {
        setMessage("Failed to load page data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Saving...");

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botJoinOffsetMinutes: offset }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings.");
      }

      const result = await response.json();
      setMessage(result.message || "Settings saved successfully!");
    } catch (error: any) {
      setMessage(error.message || "An error occurred.");
    }
  };

  const handleDisconnect = async (provider: string) => {
    try {
      await fetch("/api/connections/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      setConnections(connections.filter((c) => c.provider !== provider));
    } catch (error) {
      console.error(`Failed to disconnect ${provider}`, error);
    }
  };

  const isLinkedInConnected = connections.some(
    (c) => c.provider === "linkedin"
  );

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Bot Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="offset">
                Join Meeting (minutes before start)
              </Label>
              <Input
                id="offset"
                type="number"
                value={offset}
                onChange={(e) => setOffset(e.target.value)}
                placeholder="e.g., 5"
                min="0"
                required
              />
            </div>
            <Button type="submit">Save Settings</Button>
            {message && <p className="text-sm text-gray-600 pt-2">{message}</p>}
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Social Media Connections</CardTitle>
          <CardDescription>
            Connect your social media accounts to post content directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
