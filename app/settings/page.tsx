// app/settings/page.tsx

"use client";

import { FormEvent, useEffect, useState } from "react";
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
import { Automation } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Connection {
  provider: string;
}

export default function SettingsPage() {
  const [offset, setOffset] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);

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

        const automationsRes = await fetch("/api/automations");
        const automationsData = await automationsRes.json();
        setAutomations(automationsData);
      } catch (error) {
        setMessage("Failed to load page data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, []);

  const handleAddAutomation = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAutomation = {
      name: formData.get("name") as string,
      platform: formData.get("platform") as string,
      prompt: formData.get("prompt") as string,
    };

    const response = await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAutomation),
    });

    if (response.ok) {
      const created = await response.json();
      setAutomations([...automations, created]);
      // Here you would close the dialog
    }
  };

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
      <Card className="mb-8">
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
      {/* --- NEW AUTOMATIONS CARD --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Automations</CardTitle>
            <CardDescription>
              Configure how your social media posts are generated.
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Automation</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Automation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAutomation} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Generate LinkedIn post"
                    required
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select name="type" defaultValue="generate_post">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generate_post">
                        Generate post
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select name="platform" required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prompt">Description (Prompt)</Label>
                  <Textarea
                    id="prompt"
                    name="prompt"
                    placeholder="1. Draft a post..."
                    required
                    rows={5}
                  />
                </div>
                <div>
                  <Label htmlFor="example">Example</Label>
                  <Textarea
                    id="example"
                    name="example"
                    placeholder="An example of the desired output..."
                    rows={5}
                  />
                </div>
                <Button type="submit">Save & Close</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {automations.map((auto) => (
              <div
                key={auto.id}
                className="flex justify-between items-center p-2 border rounded-md"
              >
                <span>{auto.name}</span>
                <span className="text-sm text-muted-foreground">
                  {auto.platform}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
