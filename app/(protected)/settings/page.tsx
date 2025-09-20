// app/(protected)/settings/page.tsx

"use client";

import { FormEvent, useEffect, useState } from "react";
import { Account, Automation } from "@prisma/client";
import { BotConfiguration } from "@/app/(protected)/settings/components/BotConfiguration";
import { SocialConnections } from "@/app/(protected)/settings/components/SocialConnections";
import { Automations } from "@/app/(protected)/settings/components/Automations";
import { GoogleConnections } from "./components/GoogleConnections";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const [offset, setOffset] = useState("");
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
        toast.error((error as Error).message || "Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, []);

  const handleSaveOffset = async (e: React.FormEvent) => {
    e.preventDefault();

    const promise = fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botJoinOffsetMinutes: offset }),
    }).then((res) => {
      if (!res.ok) {
        throw new Error("Failed to save settings. Please try again.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Saving settings...",
      success: "Settings saved successfully!",
      error: (err) => err.toString(),
    });
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
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/3" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account, connections, and content generation settings.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application and bot behavior.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BotConfiguration
                offset={offset}
                setOffset={setOffset}
                handleSubmit={handleSaveOffset}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="connections">
          <div className="space-y-4">
            <GoogleConnections
              connections={connections}
              handleDisconnect={handleDisconnect}
            />
            <SocialConnections
              connections={connections}
              handleDisconnect={handleDisconnect}
            />
          </div>
        </TabsContent>
        <TabsContent value="automations">
          <Automations
            automations={automations}
            setAutomations={setAutomations}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
