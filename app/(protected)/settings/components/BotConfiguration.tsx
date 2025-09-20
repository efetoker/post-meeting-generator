// app/settings/components/BotConfiguration.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BotConfigurationProps {
  offset: string;
  setOffset: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function BotConfiguration({
  offset,
  setOffset,
  handleSubmit,
}: BotConfigurationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="offset">Join Meeting (minutes before start)</Label>
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
        </form>
      </CardContent>
    </Card>
  );
}
