// app/settings/page.tsx

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const [offset, setOffset] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) throw new Error("Could not load settings.");

        const data = await response.json();
        setOffset(data.botJoinOffsetMinutes.toString());
      } catch (error) {
        setMessage("Failed to load current settings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
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

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Card>
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
    </div>
  );
}
