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
import { signIn } from "next-auth/react";

interface Connection {
  provider: string;
}

interface SocialConnectionsProps {
  connections: Connection[];
  handleDisconnect: (provider: string) => void;
}

export function SocialConnections({
  connections,
  handleDisconnect,
}: SocialConnectionsProps) {
  const isLinkedInConnected = connections.some(
    (c) => c.provider === "linkedin"
  );
  const isFacebookConnected = connections.some(
    (c) => c.provider === "facebook"
  );

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
        </div>
      </CardContent>
    </Card>
  );
}
