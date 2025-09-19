// app/settings/components/GoogleConnections.tsx

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Account } from "@prisma/client";

interface GoogleConnectionsProps {
  connections: Account[];
  handleDisconnect: (provider: string, providerAccountId: string) => void;
}

export function GoogleConnections({
  connections,
  handleDisconnect,
}: GoogleConnectionsProps) {
  const googleAccounts = connections.filter((c) => c.provider === "google");

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Google Calendar Connections</CardTitle>
        <CardDescription>
          Connect additional Google accounts to see all your events.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {googleAccounts.map((account) => (
          <div
            key={account.providerAccountId}
            className="flex items-center justify-between p-2 border rounded-md"
          >
            <span className="text-sm">
              Account ID: ...{account.providerAccountId?.slice(-6) || "N/A"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleDisconnect("google", account.providerAccountId)
              }
            >
              Disconnect
            </Button>
          </div>
        ))}
        <a href="/api/auth/connect/google">
          <Button>Connect another Google Account</Button>
        </a>
      </CardContent>
    </Card>
  );
}
