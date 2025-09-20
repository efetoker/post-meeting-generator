// app/settings/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { Account, Automation } from "@prisma/client";
import { BotConfiguration } from "@/app/settings/components/BotConfiguration";
import { SocialConnections } from "@/app/settings/components/SocialConnections";
import { Automations } from "@/app/settings/components/Automations";
import { GoogleConnections } from "./components/GoogleConnections";

export default function SettingsPage() {
  const [offset, setOffset] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [connections, setConnections] = useState<Account[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);

  useEffect(() => {
    const loadPageData = async () => {
      setIsLoading(true);
      try {
        const [settingsRes, connectionsRes, automationsRes] = await Promise.all(
          [
            fetch("/api/settings"),
            fetch("/api/connections"),
            fetch("/api/automations"),
          ]
        );

        if (!settingsRes.ok) throw new Error("Could not load settings.");
        const settingsData = await settingsRes.json();
        setOffset(settingsData.botJoinOffsetMinutes.toString());

        if (!connectionsRes.ok) throw new Error("Could not load connections.");
        const connectionsData = await connectionsRes.json();
        setConnections(connectionsData);

        if (!automationsRes.ok) throw new Error("Could not load automations.");
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
      example: formData.get("example") as string,
    };

    const response = await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAutomation),
    });

    if (response.ok) {
      const created = await response.json();
      setAutomations([...automations, created]);
      // !TODO: Close dialog
    }
  };

  const handleSaveOffset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Saving...");
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botJoinOffsetMinutes: offset }),
      });
      if (!response.ok) throw new Error("Failed to save settings.");
      const result = await response.json();
      setMessage(result.message || "Settings saved successfully!");
    } catch (error: any) {
      setMessage(error.message || "An error occurred.");
    }
  };

  const handleDisconnect = async (
    provider: string,
    providerAccountId: string
  ) => {
    try {
      await fetch("/api/connections/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, providerAccountId }),
      });
      setConnections(
        connections.filter((c) => c.providerAccountId !== providerAccountId)
      );
    } catch (error) {
      console.error(`Failed to disconnect ${provider}`, error);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <GoogleConnections
        connections={connections}
        handleDisconnect={handleDisconnect}
      />

      <BotConfiguration
        offset={offset}
        setOffset={setOffset}
        handleSubmit={handleSaveOffset}
        message={message}
      />

      <SocialConnections
        connections={connections}
        handleDisconnect={handleDisconnect}
      />

      <Automations
        automations={automations}
        handleAddAutomation={handleAddAutomation}
      />
    </div>
  );
}
