// app/(protected)/settings/components/GoogleConnections.tsx

"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Account } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface GoogleConnectionsProps {
  connections: Account[];
  handleDisconnect: (provider: string, providerAccountId: string) => void;
}

export function GoogleConnections({
  connections,
  handleDisconnect,
}: GoogleConnectionsProps) {
  const { data: session } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accountToDisconnect, setAccountToDisconnect] =
    useState<Account | null>(null);

  const googleAccounts = connections.filter((c) => c.provider === "google");

  const primaryAccount = googleAccounts.find(
    (acc) => acc.email === session?.user?.email
  );

  const additionalAccounts = googleAccounts.filter(
    (acc) => acc.email !== session?.user?.email
  );

  const openConfirmationDialog = (account: Account) => {
    setAccountToDisconnect(account);
    setDialogOpen(true);
  };

  const confirmDisconnect = () => {
    if (accountToDisconnect) {
      handleDisconnect("google", accountToDisconnect.providerAccountId);
    }
    setDialogOpen(false);
    setAccountToDisconnect(null);
  };

  return (
    <>
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
                <span className="font-semibold">{primaryAccount.email}</span>
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
                onClick={() => openConfirmationDialog(account)}
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

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently disconnect the account{" "}
              <strong className="text-foreground">
                {accountToDisconnect?.email}
              </strong>
              . You will no longer see its calendar events in the app.
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
