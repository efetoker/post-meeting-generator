// app/admin/logs/page.tsx

import { headers } from "next/headers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@iconify/react";

async function getCronLogs() {
  const cookie = (await headers()).get("cookie") ?? "";
  const API_BASE_URL = process.env.AUTH_URL || "http://localhost:3000";

  const response = await fetch(`${API_BASE_URL}/api/admin/logs`, {
    headers: { cookie },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch logs.");
  }

  return response.json();
}

export default async function CronLogsPage() {
  const logs = await getCronLogs();

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cron Job Logs</h1>
        <p className="text-muted-foreground mt-2">
          Showing the last 100 polling job executions. Repeated or closely timed entries indicate retries due to errors.
        </p>
      </div>

      <Card>
        <CardContent className="px-6">
          <div className="space-y-4">
            {logs.length > 0 ? (
              logs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <Icon
                    icon="lucide:check-circle"
                    className="h-5 w-5 text-green-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No logs found.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
