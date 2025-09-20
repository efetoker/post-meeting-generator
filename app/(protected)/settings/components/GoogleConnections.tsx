// app/(protected)/settings/components/GoogleConnections.tsx

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
import { useSession } from "next-auth/react";
import { Icon } from "@iconify/react";

interface GoogleConnectionsProps {
  connections: Account[];
  handleDisconnect: (provider: string, providerAccountId: string) => void;
}

export function GoogleConnections({
  connections,
  handleDisconnect,
}: GoogleConnectionsProps) {
  const { data: session } = useSession();
  const googleAccounts = connections.filter((c) => c.provider === "google");

  const primaryAccount = googleAccounts.find(
    (acc) => acc.email === session?.user?.email
  );

  const additionalAccounts = googleAccounts.filter(
    (acc) => acc.email !== session?.user?.email
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Calendar Connections</CardTitle>
        <CardDescription>
          Connect additional Google accounts to see all your events.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {primaryAccount && (
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <Icon icon="logos:google-icon" className="h-5 w-5" />
              <div className="flex flex-col">
                <span className="font-semibold">{primaryAccount.email}</span>
              </div>
            </div>
            <div className="rounded-md bg-ghost px-2.5 py-1 text-sm font-semibold text-primary">
              Primary
            </div>
          </div>
        )}

        {additionalAccounts.map((account) => (
          <div
            key={account.providerAccountId}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              <Icon icon="logos:google-icon" className="h-5 w-5" />
              <span className="font-semibold">
                {account.email ||
                  `Account ID: ...${account.providerAccountId?.slice(-6)}`}
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                handleDisconnect("google", account.providerAccountId)
              }
            >
              Disconnect
            </Button>
          </div>
        ))}

        <div className="mt-2">
          <a href="/api/auth/connect/google">
            <Button variant="outline">
              <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
              Connect another Google Account
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
